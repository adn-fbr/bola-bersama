"""Uji alur Fase 1 dan batas akses melalui API publik (RLS + RPC berlaku).
Butuh 5 akun uji khusus dan database pengembangan yang boleh ditulis. Akun admin uji harus
memiliki app_metadata.allow_demo_role_claims=true. Jangan jalankan terhadap produksi.
Jalankan: python supabase/tests/phase1_access.py
"""
import os, sys, datetime, base64, json, uuid
from urllib.parse import urlparse

if os.environ.get("PHASE1_ALLOW_WRITES") != "1":
    raise SystemExit("Tes menulis diblokir; set PHASE1_ALLOW_WRITES=1 hanya untuk proyek uji khusus.")
if os.environ.get("PHASE1_PROJECT_IS_DISPOSABLE") != "1":
    raise SystemExit("Konfirmasi bahwa proyek Supabase khusus uji dan dapat dibuang diperlukan.")
if os.environ.get("PHASE1_MIGRATIONS_CONFIRMED") != "1":
    raise SystemExit("Konfirmasi manual urutan migrasi 0000–0003 diperlukan.")
import requests

URL = os.environ["SUPABASE_URL"]
KEY = os.environ["SUPABASE_PUBLISHABLE_KEY"]
PW = os.environ["TEST_PW"]
parsed_url = urlparse(URL)
host = parsed_url.hostname
if not host:
    raise SystemExit("SUPABASE_URL tidak valid.")
browser_urls = {value for value in (os.environ.get("VITE_SUPABASE_URL"), os.environ.get("VITE_SUPABASE_PROJECT_ID")) if value}
if browser_urls and browser_urls != {URL, host.split(".")[0]}:
    raise SystemExit("Konfigurasi Supabase browser berbeda dari target tes; tes dihentikan.")
browser_keys = {value for value in (os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY"),) if value}
if browser_keys and browser_keys != {KEY}:
    raise SystemExit("Kunci publishable browser berbeda dari target tes; tes dihentikan.")
test_project = os.environ.get("PHASE1_TEST_PROJECT_ID")
if host in ("localhost", "127.0.0.1"):
    if parsed_url.scheme not in ("http", "https"):
        raise SystemExit("SUPABASE_URL lokal harus menggunakan HTTP atau HTTPS.")
elif parsed_url.scheme != "https" or parsed_url.netloc != host or not test_project or host != f"{test_project}.supabase.co":
    raise SystemExit("SUPABASE_URL tidak cocok dengan PHASE1_TEST_PROJECT_ID.")
SSB = "11111111-1111-1111-1111-111111111111"
SSB_OTHER = "22222222-2222-2222-2222-222222222222"
RUN_ID = uuid.uuid4().hex[:8]


def require_anonymous_helpers_denied():
    helper = requests.post(
        f"{URL}/rest/v1/rpc/can_view_player",
        headers={"apikey": KEY, "Content-Type": "application/json"},
        json={"_uid": "00000000-0000-0000-0000-000000000001", "_player": "00000000-0000-0000-0000-000000000002"},
        timeout=10,
    )
    if not 400 <= helper.status_code < 500:
        raise SystemExit("Helper akses masih dapat dipanggil tanpa autentikasi; tes dihentikan sebelum menulis data.")


require_anonymous_helpers_denied()


def login(email):
    r = requests.post(f"{URL}/auth/v1/token?grant_type=password", headers={"apikey": KEY}, json={"email": email, "password": PW}, timeout=15)
    if not r.ok:
        raise SystemExit(f"Login akun uji gagal dengan HTTP {r.status_code}.")
    tok = r.json()["access_token"]
    return {"apikey": KEY, "Authorization": f"Bearer {tok}", "Content-Type": "application/json"}


def require_phase1_schema(headers):
    r = requests.get(
        f"{URL}/rest/v1/rpc/respond_enrollment",
        headers=headers,
        params={"_req": "00000000-0000-0000-0000-000000000000", "_note": "preflight"},
        timeout=10,
    )
    if r.status_code == 404:
        raise SystemExit("RPC Fase 1 tidak ditemukan; pastikan migrasi 0002 sudah diterapkan.")
    if r.status_code != 405:
        raise SystemExit(f"Preflight skema Fase 1 gagal dengan HTTP {r.status_code}.")


def rpc(h, name, **args):
    return requests.post(f"{URL}/rest/v1/rpc/{name}", headers=h, json=args, timeout=15)


def subject(headers):
    token = headers["Authorization"].split(" ", 1)[1]
    payload = token.split(".")[1]
    decoded = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
    return json.loads(decoded)["sub"]


def sel(h, path):
    r = requests.get(f"{URL}/rest/v1/{path}", headers=h, timeout=15)
    r.raise_for_status()
    return r.json()


def rejected(response):
    return 400 <= response.status_code < 500


def require_success(response, action):
    if not response.ok:
        raise SystemExit(f"{action} gagal dengan HTTP {response.status_code}.")
    return response


fails = []
def check(cond, msg):
    print(("LULUS " if cond else "GAGAL ") + msg)
    if not cond:
        fails.append(msg)


A, B, ADM, C1, C2 = (login(e) for e in ["wali.a@test.local", "wali.b@test.local", "admin@test.local", "coach@test.local", "coach2@test.local"])
require_phase1_schema(A)
A_ID = subject(A)

require_success(rpc(A, "claim_parent_role"), "Klaim peran wali A")
require_success(rpc(B, "claim_parent_role"), "Klaim peran wali B")
r = require_success(rpc(A, "create_child", _name=f"Raka Uji {RUN_ID}", _birth="2015-03-10", _position="Gelandang", _consent_data=True, _consent_media=False), "Pembuatan profil anak")
check(True, "wali membuat profil anak"); child = r.json()
check(rejected(rpc(A, "create_child", _name="Tanpa Izin", _birth="2015-03-10", _position="", _consent_data=False, _consent_media=False)), "profil ditolak tanpa persetujuan wali")
r = require_success(rpc(A, "request_enrollment", _player=child, _org=SSB, _note=""), "Pengajuan pendaftaran SSB")
check(True, "wali mengajukan pendaftaran SSB"); req = r.json()

check(sel(B, f"player_profiles?id=eq.{child}") == [], "wali lain tidak melihat anak")
helper = rpc(B, "can_view_player", _uid=A_ID, _player=child)
check(helper.ok and helper.json() is False, "wali tidak dapat memakai helper untuk menyamar sebagai wali lain")
check(rejected(rpc(B, "request_enrollment", _player=child, _org=SSB, _note="")), "wali lain tidak bisa mendaftarkan anak")
check(sel(C1, f"player_profiles?id=eq.{child}") == [], "pelatih tanpa tugas tidak melihat anak")
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=None, _note="")), "non-admin tidak bisa memutuskan")
check(rejected(rpc(A, "decide_enrollment", _req=req, _decision="approved", _team=None, _note="")), "wali tidak dapat menyetujui pendaftarannya sendiri")
check(rejected(requests.post(f"{URL}/rest/v1/player_profiles", headers=B, json={"full_name": "x", "birth_date": "2015-01-01", "created_by": "00000000-0000-0000-0000-000000000000"}, timeout=15)), "tulis langsung ke tabel diblokir")

anonymous = {"apikey": KEY, "Content-Type": "application/json"}
check(
    rejected(rpc(anonymous, "is_guardian", _uid="00000000-0000-0000-0000-000000000001", _player=child)),
    "anon tidak dapat memanggil helper relasi wali",
)
check(
    rejected(rpc(anonymous, "can_view_player", _uid="00000000-0000-0000-0000-000000000001", _player=child)),
    "anon tidak dapat memanggil helper akses pemain",
)
check(rejected(rpc(B, "dev_claim_demo_role", _org=SSB, _role="ssb_admin")), "akun biasa tidak dapat mengklaim peran pengelola demo")
require_success(rpc(ADM, "dev_claim_demo_role", _org=SSB, _role="ssb_admin"), "Klaim peran manajemen SSB")
require_success(rpc(ADM, "dev_claim_demo_role", _org=SSB_OTHER, _role="ssb_admin"), "Klaim peran manajemen SSB kedua")
team12 = rpc(ADM, "create_team", _org=SSB, _name=f"Uji {RUN_ID} U-12", _age="U-12")
team10 = rpc(ADM, "create_team", _org=SSB, _name=f"Uji {RUN_ID} U-10", _age="U-10")
foreign_team = rpc(ADM, "create_team", _org=SSB_OTHER, _name=f"Uji {RUN_ID} Lintas SSB", _age="U-12")
require_success(team12, "Pembuatan tim U-12")
require_success(team10, "Pembuatan tim U-10")
require_success(foreign_team, "Pembuatan tim SSB lain")
check(True, "manajemen membuat tim uji terisolasi")
t12, t10 = team12.json(), team10.json()
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=foreign_team.json(), _note="")), "permintaan tidak dapat disetujui ke tim SSB lain")
check(sel(B, f"teams?id=eq.{t12}") == [], "wali lain tidak melihat tim keluarga lain")
check(sel(C2, f"teams?id=eq.{t12}") == [], "pelatih tanpa penugasan tidak melihat tim ini")
check(len(sel(ADM, f"player_profiles?id=eq.{child}")) == 1, "admin SSB melihat pemohon")
check(sel(B, f"notifications?user_id=eq.{A_ID}") == [], "wali lain tidak melihat notifikasi pribadi")
reject_player_result = require_success(rpc(A, "create_child", _name=f"Anak Ditolak {RUN_ID}", _birth="2015-03-10", _position="", _consent_data=True, _consent_media=False), "Pembuatan profil untuk uji penolakan")
check(True, "wali membuat profil uji penolakan")
reject_player = reject_player_result.json()
reject_request_result = require_success(rpc(A, "request_enrollment", _player=reject_player, _org=SSB, _note=""), "Pengajuan untuk uji penolakan")
check(True, "wali mengirim permintaan uji penolakan")
reject_request = reject_request_result.json()
check(rpc(ADM, "decide_enrollment", _req=reject_request, _decision="rejected", _team=None, _note="Kuota penuh").ok, "SSB menolak permintaan uji")
check(sel(ADM, f"player_profiles?id=eq.{reject_player}") == [], "SSB tidak melihat profil setelah permintaan ditolak")
check(rpc(ADM, "decide_enrollment", _req=req, _decision="needs_info", _team=None, _note="Mohon lengkapi informasi").ok, "SSB dapat meminta kelengkapan dengan alasan")
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=t12, _note="")), "SSB tidak dapat memutuskan sebelum wali merespons")
check(rejected(rpc(B, "respond_enrollment", _req=req, _note="Jawaban wali lain")), "wali lain tidak dapat menjawab permintaan")
check(rpc(A, "respond_enrollment", _req=req, _note="Informasi tambahan sudah dilengkapi").ok, "wali mengirim kelengkapan")
check(sel(A, f"enrollment_requests?id=eq.{req}")[0]["status"] == "pending", "kelengkapan mengembalikan status ke menunggu review")
check(len(sel(ADM, "notifications?title=eq.Kelengkapan%20pendaftaran%20diterima")) >= 1, "SSB menerima notifikasi jawaban wali")
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="rejected", _team=None, _note="")), "penolakan wajib beralasan")
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="rejected", _team=None, _note="Tidak diterima")), "permintaan yang disetujui tidak dapat ditolak ulang")
check(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=t12, _note="Selamat").ok, "admin menyetujui & menempatkan di tim")
check(rejected(rpc(ADM, "decide_enrollment", _req=req, _decision="approved", _team=t12, _note="Ulang")), "persetujuan berulang ditolak")
memberships = sel(ADM, f"team_memberships?player_id=eq.{child}&active=eq.true")
check(len(memberships) == 1 and memberships[0]["team_id"] == t12, "persetujuan membuat tepat satu keanggotaan aktif")
check(len(sel(ADM, f"audit_logs?entity_id=eq.{req}")) >= 1, "keputusan tercatat pada audit")
check(rejected(rpc(A, "request_enrollment", _player=child, _org=SSB, _note="Kirim ulang")), "pengajuan ulang tidak menggandakan pendaftaran aktif")
check(rpc(ADM, "assign_coach", _team=t12, _email="coach@test.local").ok, "admin menugaskan pelatih U-12")
check(rpc(ADM, "assign_coach", _team=t10, _email="coach2@test.local").ok, "admin menugaskan pelatih U-10")

check(len(sel(C1, f"player_profiles?id=eq.{child}")) == 1, "pelatih tim melihat pemain yang ditugaskan")
check(sel(C2, f"player_profiles?id=eq.{child}") == [], "pelatih tim lain tidak melihat pemain")
check(sel(C2, f"team_memberships?player_id=eq.{child}") == [], "pelatih tim lain tidak melihat keanggotaan")
when = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + "Z"
check(rpc(C1, "create_training", _team=t12, _title="Passing & kontrol", _starts=when, _location="Lapangan Sidolig").ok, "pelatih membuat sesi latihan")
check(rejected(rpc(C2, "create_training", _team=t12, _title="X", _starts=when, _location="")), "pelatih lain tidak bisa membuat latihan tim ini")

check(len(sel(A, f"training_sessions?team_id=eq.{t12}")) >= 1, "wali melihat jadwal anak")
check(sel(C2, f"training_sessions?team_id=eq.{t12}") == [], "pelatih lain tidak melihat jadwal latihan")
check(len(sel(A, "notifications?title=like.Status*")) >= 1, "wali menerima keputusan pendaftaran")
check(sel(B, f"training_sessions?team_id=eq.{t12}") == [], "wali lain tidak melihat jadwal")

print("\nSEMUA UJI LULUS" if not fails else f"\n{len(fails)} UJI GAGAL")
sys.exit(1 if fails else 0)
