# e-Devlet Veri Çekme - ÖRNEK KOD (SADECE DEMO)
# Türkçe teknik yorumlar
# UYARI: Bu kod gerçek e-Devlet sistemine bağlanmaz. Tamamen kurgusal örnek yapıdır.

import requests
import json
import hashlib
import hmac
import base64
import time
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# 1) Sahte oturum yöneticisi (gerçek e-Devlet API'si yoktur)
class FakeEDevletSession:
    def __init__(self, tc_no: str, password: str):
        self.tc_no = tc_no
        self.password = password
        self.token = None
        self.session_id = None
        self.expires_at = None
        
    # 2) Sahte giriş - token üretir (gerçek değil)
    def login(self) -> bool:
        # 11 haneli TC kontrolü (örnek doğrulama)
        if not re.match(r'^[1-9]\d{10}$', self.tc_no):
            return False
        if len(self.password) < 4:
            return False
        
        # Sahte token oluştur
        raw = f"{self.tc_no}:{self.password}:{int(time.time())}"
        self.token = base64.b64encode(hashlib.sha256(raw.encode()).digest()).decode()[:32]
        self.session_id = f"SESS-{random.randint(100000, 999999)}"
        self.expires_at = datetime.now() + timedelta(minutes=30)
        return True
    
    # 3) Sahte kimlik bilgisi çekme
    def get_identity(self) -> Dict:
        if not self.token:
            return {"error": "Oturum açılmamış"}
        
        # Kurgusal veri
        fake_names = ["Ali", "Ayşe", "Mehmet", "Zeynep", "Hasan", "Emine", "Veli", "Fatma"]
        fake_surnames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Kurt", "Öztürk", "Polat"]
        fake_cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Adana", "Gaziantep"]
        
        return {
            "tc_no": self.tc_no,
            "ad": random.choice(fake_names),
            "soyad": random.choice(fake_surnames),
            "dogum_tarihi": f"{random.randint(1,28)}.{random.randint(1,12)}.{random.randint(1950, 2005)}",
            "dogum_yeri": random.choice(fake_cities),
            "medeni_durum": random.choice(["Bekar", "Evli", "Boşanmış", "Dul"]),
            "cinsiyet": random.choice(["Erkek", "Kadın"]),
            "kan_grubu": random.choice(["A Rh+", "A Rh-", "B Rh+", "B Rh-", "0 Rh+", "0 Rh-", "AB Rh+", "AB Rh-"]),
            "anne_adi": random.choice(fake_names) + " " + random.choice(fake_surnames),
            "baba_adi": random.choice(fake_names) + " " + random.choice(fake_surnames),
            "nufus_il": random.choice(fake_cities),
            "nufus_ilce
