# Catálogo de música de fondo

Generado con `python scripts/catalogo-musica.py` desde mediciones reales (`scripts/perfil-musica.py`, librosa): no se
puede escuchar desde acá, así que todo lo de "carácter" sale de números, no de oído. **Lucas elige a oído.**

- **Derechos**: `libre/biblioteca` = el nombre dice sin copyright, NCS o es de biblioteca (ANBR, Danny Shields, Ardie
  Son, Yehezkel Raz, Soundride, DivKid). `COMERCIAL` = tema de artista conocido: en un video que sube Nexora, Instagram
  o TikTok pueden silenciar el audio. `sin confirmar` = no se sabe por el nombre.
- **Dinámica** (dB entre las partes suaves y las fuertes): < 8 dB es una cama pareja que no compite con la voz;
  > 16 dB tiene crescendos que tapan la voz en los picos.
- **Arranca**: segundo donde la energía llega cerca del máximo (antes es intro).
- ⭐ = Lucas lo marcó como ganador (le agrega "ganador" al nombre del archivo).
- Para usarlo: copia liviana a `public/recursos/` y bloque `musica` en `props.json` (ver `MusicaConfig` en
  `src/pieza/types.ts`), con `inicioS` en un tiempo fuerte.

| id | Tema | Derechos | BPM | Dinámica | Brillo | Arranca | Duración | Carácter (por datos) | Usado en |
|---|---|---|---|---|---|---|---|---|---|
| musica-067 | ANBR - Quantum(1).wav | libre/biblioteca | 117.5 | 4.4 dB | 1678 Hz | 20 s | 221.4 s | pareja, media | - |
| musica-068 | ANBR - Quantum.wav (duplicado) | libre/biblioteca | 117.5 | 4.4 dB | 1678 Hz | 20 s | 221.4 s | pareja, media | estructura-nexora |
| musica-069 | Ardie Son - Infinite Circles - No Backing Vocals(1).wav | libre/biblioteca | 152.0 | 14.9 dB | 1011 Hz | 60 s | 240.0 s | con subidas, media, intro larga (60 s) | - |
| musica-070 | Ardie Son - Infinite Circles - No Backing Vocals.wav (duplicado) | libre/biblioteca | 152.0 | 14.9 dB | 1011 Hz | 60 s | 240.0 s | con subidas, media, intro larga (60 s) | - |
| musica-074 | Danny Shields - Tethered to the Sky(1).wav | libre/biblioteca | 117.5 | 30.1 dB | 988 Hz | 22 s | 207.1 s | muy dinámica, media | - |
| musica-075 | Danny Shields - Tethered to the Sky.wav (duplicado) | libre/biblioteca | 117.5 | 30.1 dB | 988 Hz | 22 s | 207.1 s | muy dinámica, media | - |
| musica-076 | DivKid - Parisian Funk.mp3 | libre/biblioteca | 123.0 | 12.1 dB | 2520 Hz | 30 s | 182.7 s | con subidas, brillante | - |
| musica-053 | Low Mileage - Hold You [NCS Release].mp3 | libre/biblioteca | 152.0 | 10.9 dB | 1534 Hz | 26 s | 141.2 s | con subidas, media | - |
| musica-097 | Reprise - Class Act - ANBR Adrian Berenguer.mp3 | libre/biblioteca | 152.0 | 8.4 dB | 1481 Hz | 52 s | 186.5 s | con subidas, media, intro larga (52 s) | - |
| musica-103 | Tension Cinematic NoCopyright Background Music  The Heist by Soundridemusic.mp3 | libre/biblioteca | 99.4 | 169.8 dB | 902 Hz | 2 s | 196.9 s | muy dinámica, media | - |
| musica-123 | X2Download.app - Música de violín (Épica Música sin Copyright) (128 kbps) (2).mp3 | libre/biblioteca | 117.5 | 8.0 dB | 1474 Hz | 20 s | 122.2 s | con subidas, media | - |
| musica-128 | Y2meta.app - MUSICA LOFI (Sin Copyright) #25 🍵 (128 kbps).mp3 | libre/biblioteca | 161.5 | 20.2 dB | 529 Hz | 24 s | 192.6 s | muy dinámica, oscura | - |
| musica-091 | Yehezkel Raz - As Long as in the Heart(1).wav | libre/biblioteca | 99.4 | 19.7 dB | 532 Hz | 10 s | 136.8 s | muy dinámica, oscura | - |
| musica-092 | Yehezkel Raz - As Long as in the Heart.wav (duplicado) | libre/biblioteca | 99.4 | 19.7 dB | 532 Hz | 10 s | 136.8 s | muy dinámica, oscura | - |
| musica-001 | 90MH but it_s a chill lofi type beat.mp3 | sin confirmar | 172.3 | 9.4 dB | 1363 Hz | 2 s | 102.9 s | con subidas, media | - |
| musica-007 | Call Me (Slowed) (1).mp3 | sin confirmar | 112.3 | 7.1 dB | 2735 Hz | 36 s | 160.5 s | pareja, brillante, intro larga (36 s) | - |
| musica-009 | Copia de Lost Forever.mp3 | sin confirmar | 92.3 | 15.9 dB | 1304 Hz | 2 s | 112.8 s | con subidas, media | - |
| musica-010 | Copia de Sahara.mp3 | sin confirmar | 117.5 | 26.6 dB | 926 Hz | 36 s | 171.3 s | muy dinámica, media, intro larga (36 s) | - |
| musica-011 | Copia de Snowfall.mp3 | sin confirmar | 95.7 | 27.3 dB | 331 Hz | 20 s | 123.3 s | muy dinámica, oscura | - |
| musica-012 | Copia de Stories (1).mp3 | sin confirmar | 89.1 | 7.2 dB | 613 Hz | 12 s | 96.1 s | pareja, oscura | - |
| musica-013 | Copia de Sweetly_jVOnPgW34TI (1).mp3 | sin confirmar | 123.0 | 30.7 dB | 1314 Hz | 18 s | 135.5 s | muy dinámica, media | - |
| musica-019 | DVRST - Close Eyes (Slowed  Reverb).mp3 | sin confirmar | 117.5 | 18.6 dB | 1582 Hz | 22 s | 143.8 s | muy dinámica, media | - |
| musica-020 | DVRST - Dream Space.mp3 | sin confirmar | 107.7 | 14.9 dB | 1911 Hz | 36 s | 171.7 s | con subidas, media, intro larga (36 s) | - |
| musica-021 | Easy _).mp3 | sin confirmar | 123.0 | 11.2 dB | 1200 Hz | 30 s | 202.9 s | con subidas, media | - |
| musica-022 | Echo Sax End ganador.mp3 | sin confirmar | 117.5 | 11.4 dB | 904 Hz | 2 s | 77.2 s | con subidas, media | ⭐ elegido por Lucas; - |
| musica-023 | Echo_Sax_End_by_Caleb_Arredondo.mp3 | sin confirmar | 117.5 | 14.1 dB | 888 Hz | 2 s | 77.9 s | con subidas, oscura | - |
| musica-024 | Else - Paris.mp3 | sin confirmar | 103.4 | 10.8 dB | 1703 Hz | 10 s | 209.7 s | con subidas, media | - |
| musica-027 | Epic and Dramatic Trailer Music.mp3 | sin confirmar | 129.2 | 14.1 dB | 687 Hz | 60 s | 150.8 s | con subidas, oscura, intro larga (60 s) | - |
| musica-028 | ESSENCE.mp3 | sin confirmar | 69.8 | 11.3 dB | 1512 Hz | 28 s | 206.2 s | con subidas, media | - |
| musica-030 | Frank Saint (Slowed).mp3 | sin confirmar | 129.2 | 2.7 dB | 629 Hz | 0 s | 126.2 s | pareja, oscura | - |
| musica-032 | g3oxem - GigaChad Theme (Phonk House Version).mp3 | sin confirmar | 129.2 | 11.2 dB | 2275 Hz | 30 s | 146.3 s | con subidas, brillante | - |
| musica-034 | Hal Walker - Low Key Gliding  (K08beatz remix).mp3 | sin confirmar | 117.5 | 14.4 dB | 1624 Hz | 20 s | 144.0 s | con subidas, media | - |
| musica-037 | Hensonn-Sahara.mp3 | sin confirmar | 117.5 | 26.2 dB | 909 Hz | 36 s | 171.2 s | muy dinámica, media, intro larga (36 s) | - |
| musica-038 | HOME  resonance (432 hz) (slowed  reverb).mp3 | sin confirmar | 143.6 | 3.8 dB | 656 Hz | 10 s | 240.0 s | pareja, oscura | - |
| musica-039 | i was only temporary (Slowed  Reverb).mp3 | sin confirmar | 136.0 | 17.1 dB | 352 Hz | 20 s | 102.2 s | muy dinámica, oscura | - |
| musica-040 | i was only temporary.mp3 | sin confirmar | 107.7 | 20.5 dB | 390 Hz | 18 s | 98.7 s | muy dinámica, oscura | - |
| musica-042 | if it_s real, then i_ll stay.mp3 | sin confirmar | 99.4 | 8.9 dB | 398 Hz | 10 s | 184.3 s | con subidas, oscura | - |
| musica-045 | joel sunny - luminary [original song] - official audio.mp3 | sin confirmar | 136.0 | 8.6 dB | 1796 Hz | 6 s | 189.0 s | con subidas, media | - |
| musica-080 | Life in Rio (BRAZILIAN PHONK).mp3 | sin confirmar | 129.2 | 12.6 dB | 2411 Hz | 4 s | 95.4 s | con subidas, brillante | - |
| musica-050 | Lifes Journey Begins.mp3 | sin confirmar | 143.6 | 7.5 dB | 828 Hz | 10 s | 117.7 s | pareja, oscura | - |
| musica-081 | LUNA BALA (Slowed).mp3 | sin confirmar | 112.3 | 14.1 dB | 1570 Hz | 10 s | 124.3 s | con subidas, media | - |
| musica-056 | METAMORPHOSIS ganador.mp3 | sin confirmar | 172.3 | 21.9 dB | 824 Hz | 12 s | 142.8 s | muy dinámica, oscura | ⭐ elegido por Lucas; estructura-nexora |
| musica-082 | METAMORPHOSIS.mp3 | sin confirmar | 172.3 | 21.9 dB | 824 Hz | 12 s | 142.8 s | muy dinámica, oscura | - |
| musica-061 | Mo Beats - Righteous (pepe lore song).mp3 | sin confirmar | 161.5 | 18.2 dB | 1628 Hz | 24 s | 164.0 s | muy dinámica, media | - |
| musica-085 | Mo Beats - Righteous (pepe lore song).mp3 (duplicado) | sin confirmar | 161.5 | 18.2 dB | 1628 Hz | 24 s | 164.0 s | muy dinámica, media | - |
| musica-086 | MONTAGEM LADRAO (Ultra Slowed).mp3 | sin confirmar | 103.4 | 8.2 dB | 1522 Hz | 8 s | 45.9 s | con subidas, media | - |
| musica-062 | Mr. Carmack - MONEY IS FOR RENT - NOT FOR THE SOUL.mp3 | sin confirmar | 152.0 | 9.7 dB | 2149 Hz | 50 s | 240.0 s | con subidas, brillante, intro larga (50 s) | - |
| musica-087 | NESSAS CADELA (Slowed).mp3 | sin confirmar | 117.5 | 5.5 dB | 1862 Hz | 10 s | 77.3 s | pareja, media | - |
| musica-094 | plage coquillage (kiss song ) best part only.mp3 | sin confirmar | 95.7 | 13.0 dB | 785 Hz | 38 s | 90.3 s | con subidas, oscura, intro larga (38 s) | - |
| musica-095 | plage coquillage (kiss song) instrumental -- hope core (320).mp3 | sin confirmar | 95.7 | 2.9 dB | 825 Hz | 2 s | 163.8 s | pareja, oscura | - |
| musica-098 | Seekae - Test & Recognise (Flume Re-Work).mp3 | sin confirmar | 112.3 | 4.8 dB | 1636 Hz | 18 s | 240.0 s | pareja, media | - |
| musica-101 | Suspense, Horror, Piano and Music Box.mp3 | sin confirmar | 86.1 | 1.4 dB | 1269 Hz | 2 s | 240.0 s | pareja, media | - |
| musica-102 | synthwave goose - blade runner 2049.mp3 | sin confirmar | 117.5 | 9.4 dB | 516 Hz | 18 s | 228.0 s | con subidas, oscura | - |
| musica-107 | The Lost Soul Down (Slowed & Reverb).mp3 | sin confirmar | 184.6 | 2.9 dB | 1046 Hz | 2 s | 240.0 s | pareja, media | - |
| musica-109 | The Racer.mp3 | sin confirmar | 107.7 | 24.6 dB | 1241 Hz | 126 s | 175.8 s | muy dinámica, media, intro larga (126 s) | - |
| musica-116 | vampire heart.mp3 | sin confirmar | 92.3 | 11.0 dB | 3001 Hz | 0 s | 144.0 s | con subidas, brillante | - |
| musica-117 | villiam lane - particles (slowed).mp3 | sin confirmar | 83.4 | 4.3 dB | 1568 Hz | 14 s | 165.6 s | pareja, media | - |
| musica-118 | VØJ, Narvent - Memory Reboot.mp3 | sin confirmar | 161.5 | 7.1 dB | 1858 Hz | 10 s | 216.4 s | pareja, media | - |
| musica-119 | WEEDMANE x Suicideyear SUICIDE YEAR.mp3 | sin confirmar | 64.6 | 4.9 dB | 1376 Hz | 4 s | 91.8 s | pareja, media | - |
| musica-120 | Wilee_Night_Drive_B9VH-JZ1744_140.mp3 | sin confirmar | 80.7 | 31.7 dB | 2076 Hz | 16 s | 124.7 s | muy dinámica, brillante | - |
| musica-121 | Will Van De Crommert - Concerto Grosso.mp3 | sin confirmar | 99.4 | 7.7 dB | 1701 Hz | 2 s | 226.0 s | pareja, media | - |
| musica-122 | X2Download.app - Dxrk ダーク - RAVE (Official Audio) (128 kbps).mp3 | sin confirmar | 117.5 | 5.8 dB | 858 Hz | 16 s | 169.3 s | pareja, oscura | - |
| musica-127 | Y2meta.app - luminary - joel sunny __ tiktok version (320 kbps).mp3 | sin confirmar | 136.0 | 3.3 dB | 1811 Hz | 6 s | 103.2 s | pareja, media | - |
| musica-133 | Øfdream - Thelema.mp3 | sin confirmar | 143.6 | 15.0 dB | 1376 Hz | 14 s | 209.1 s | con subidas, media | - |
| musica-134 | øneheart x reidenshi - snowfall (128 kbps).mp3 | sin confirmar | 92.3 | 27.1 dB | 328 Hz | 20 s | 123.3 s | muy dinámica, oscura | - |
| musica-002 | AFTER HOURS INSTRUMENTAL (Slowed Reverb).mp3 | COMERCIAL | 95.7 | 7.0 dB | 1423 Hz | 50 s | 170.4 s | pareja, media, intro larga (50 s) | - |
| musica-003 | Alexander Rybak - Fairytale (slowed) sub español.mp3 | COMERCIAL | 89.1 | 7.4 dB | 1738 Hz | 12 s | 223.1 s | pareja, media | - |
| musica-066 | aloe blacc i need a dollar instrumental.mp3 | COMERCIAL | 95.7 | 6.3 dB | 1877 Hz | 22 s | 240.0 s | pareja, media | - |
| musica-004 | Bakar - Hell N Back (Instrumental).mp3 | COMERCIAL | 103.4 | 2.0 dB | 1063 Hz | 2 s | 213.6 s | pareja, media | - |
| musica-005 | Billy Idol - Eyes Without A Face - (Instrumental) - (1983).mp3 | COMERCIAL | 86.1 | 5.0 dB | 2785 Hz | 2 s | 240.0 s | pareja, brillante | - |
| musica-006 | Bloody Mary (Remix).mp3 | COMERCIAL | 80.7 | 1.5 dB | 2347 Hz | 2 s | 145.8 s | pareja, brillante | - |
| musica-071 | Caravan.mp3 | COMERCIAL | 143.6 | 7.9 dB | 2225 Hz | 30 s | 240.0 s | pareja, brillante | - |
| musica-008 | Cochise - Tell Em (Instrumental Remix  slowed  reverb).mp3 | COMERCIAL | 143.6 | 7.7 dB | 973 Hz | 14 s | 231.0 s | pareja, media | - |
| musica-072 | Connor Price & Haviah Mighty & Koren - Trendsetter (Instrumental).mp3 | COMERCIAL | 95.7 | 17.0 dB | 1600 Hz | 10 s | 145.2 s | muy dinámica, media | - |
| musica-014 | Copia de Tom Odell - Another Love (Official Instrumental Video)_iE_WKhD1Hm4.mp3 | COMERCIAL | 123.0 | 27.4 dB | 950 Hz | 130 s | 240.0 s | muy dinámica, media, intro larga (130 s) | - |
| musica-015 | d savage private jet instrumental (no synth).mp3 | COMERCIAL | 136.0 | 2.7 dB | 543 Hz | 4 s | 187.4 s | pareja, oscura | - |
| musica-073 | d savage private jet instrumental (no synth).mp3 (duplicado) | COMERCIAL | 136.0 | 2.7 dB | 543 Hz | 4 s | 187.4 s | pareja, oscura | - |
| musica-016 | Drake - Another Late Night ft. Lil Yachty.mp3 | COMERCIAL | 161.5 | 9.6 dB | 962 Hz | 0 s | 170.1 s | con subidas, media | - |
| musica-017 | Drake - First Person Shooter (Instrumental) feat. J. Cole.mp3 | COMERCIAL | 80.7 | 20.2 dB | 1326 Hz | 32 s | 240.0 s | muy dinámica, media, intro larga (32 s) | - |
| musica-077 | DRAKE - HEART ON MY SLEEVE FT. THE WEEKND (OFFICIAL INSTRUMENTAL)  DRAKE AI (1).mp3 | COMERCIAL | 136.0 | 21.2 dB | 1114 Hz | 8 s | 136.8 s | muy dinámica, media | - |
| musica-018 | DRAKE - HEART ON MY SLEEVE FT. THE WEEKND (OFFICIAL INSTRUMENTAL)  DRAKE AI.mp3 (duplicado) | COMERCIAL | 136.0 | 21.2 dB | 1114 Hz | 8 s | 136.8 s | muy dinámica, media | - |
| musica-025 | Empire of the Sun - Walking on a Dream (Instrumental).mp3 | COMERCIAL | 129.2 | 10.6 dB | 1675 Hz | 16 s | 197.5 s | con subidas, media | - |
| musica-078 | Empire of the Sun - Walking on a Dream (Instrumental).mp3 (duplicado) | COMERCIAL | 129.2 | 10.6 dB | 1675 Hz | 16 s | 197.5 s | con subidas, media | - |
| musica-026 | End Song Project X soundtrack.mp3 | COMERCIAL | 198.8 | 6.6 dB | 915 Hz | 40 s | 240.0 s | pareja, media, intro larga (40 s) | - |
| musica-029 | Frank Ocean - Lost (Instrumental).mp3 | COMERCIAL | 123.0 | 5.7 dB | 1106 Hz | 4 s | 236.1 s | pareja, media | - |
| musica-031 | Future - Last Breath (Creed Motivation) 2.mp3 | COMERCIAL | 89.1 | 6.4 dB | 1567 Hz | 26 s | 240.0 s | pareja, media | - |
| musica-033 | Golden Hour_ Piano Version.mp3 | COMERCIAL | 61.5 | 16.4 dB | 626 Hz | 34 s | 212.3 s | muy dinámica, oscura, intro larga (34 s) | - |
| musica-035 | Hand Covers Bruise (HD) - From the Soundtrack to The Social Network.mp3 | COMERCIAL | 161.5 | 19.1 dB | 963 Hz | 104 s | 240.0 s | muy dinámica, media, intro larga (104 s) | - |
| musica-036 | Hans Zimmer - Cornfield Chase.mp3 | COMERCIAL | 95.7 | 24.9 dB | 933 Hz | 82 s | 126.2 s | muy dinámica, media, intro larga (82 s) | - |
| musica-041 | Ice Spice - In Ha Mood (Instrumental).mp3 | COMERCIAL | 69.8 | 25.8 dB | 1033 Hz | 34 s | 129.9 s | muy dinámica, media, intro larga (34 s) | - |
| musica-079 | Ice Spice - In Ha Mood (Instrumental).mp3 (duplicado) | COMERCIAL | 69.8 | 25.8 dB | 1033 Hz | 34 s | 129.9 s | muy dinámica, media, intro larga (34 s) | - |
| musica-043 | Interstellar - Main Theme - Hans Zimmer (Epic instrumentalpiano cover).mp3 | COMERCIAL | 117.5 | 9.9 dB | 549 Hz | 72 s | 240.0 s | con subidas, oscura, intro larga (72 s) | - |
| musica-044 | J.I.D - Surround Sound (feat. 21 Savage & Baby Tate).mp3 | COMERCIAL | 99.4 | 15.3 dB | 1550 Hz | 14 s | 221.1 s | con subidas, media | - |
| musica-046 | Kanye West - Runaway (Instrumental).mp3 | COMERCIAL | 172.3 | 28.2 dB | 1614 Hz | 40 s | 240.0 s | muy dinámica, media, intro larga (40 s) | - |
| musica-047 | ken car$on - yale (instrumental).mp3 | COMERCIAL | 71.8 | 13.4 dB | 1304 Hz | 0 s | 110.0 s | con subidas, media | - |
| musica-048 | Ken Carson  Swag Overload [Closest Instrumental] (Prod. By Lucian & Jonah Abraham).mp3 | COMERCIAL | 152.0 | 22.1 dB | 1522 Hz | 4 s | 155.1 s | muy dinámica, media | - |
| musica-049 | Kendrick Lamar - Not Like Us (INSTRUMENTAL) Drake Diss.mp3 | COMERCIAL | 99.4 | 20.9 dB | 1273 Hz | 8 s | 240.0 s | muy dinámica, media | - |
| musica-051 | Like That - Metro Boomin, Future.mp3 | COMERCIAL | 107.7 | 15.1 dB | 1983 Hz | 18 s | 240.0 s | con subidas, media | - |
| musica-052 | Lil Uzi Vert- 20 Min (Instrumental).mp3 | COMERCIAL | 123.0 | 2.9 dB | 2185 Hz | 0 s | 217.4 s | pareja, brillante | - |
| musica-054 | lyrics Another Love -- Tiktok Version.mp3 | COMERCIAL | 117.5 | 10.6 dB | 1444 Hz | 52 s | 240.0 s | con subidas, media, intro larga (52 s) | - |
| musica-055 | M.I.A. - Paper Planes Instrumental.mp3 | COMERCIAL | 172.3 | 6.5 dB | 2245 Hz | 12 s | 203.7 s | pareja, brillante | - |
| musica-057 | Metro Boomin - Space Cadet (Instrumental).mp3 | COMERCIAL | 107.7 | 17.1 dB | 1043 Hz | 40 s | 203.3 s | muy dinámica, media, intro larga (40 s) | - |
| musica-083 | Metro Boomin - Space Cadet (Instrumental).mp3 (duplicado) | COMERCIAL | 107.7 | 17.1 dB | 1043 Hz | 40 s | 203.3 s | muy dinámica, media, intro larga (40 s) | - |
| musica-058 | Metro Boomin - Walk Em Down (Don_t Kill Civilians) [Instrumental].mp3 | COMERCIAL | 80.7 | 16.9 dB | 876 Hz | 10 s | 240.0 s | muy dinámica, oscura | - |
| musica-059 | metro-boomin-too-many-nights-instrumental-128-ytshorts.savetube.me.mp3 | COMERCIAL | 89.1 | 9.3 dB | 1338 Hz | 22 s | 199.9 s | con subidas, media | - |
| musica-060 | MF Doom - Rapp Snitch Knishes [Instrumental].mp3 | COMERCIAL | 95.7 | 4.0 dB | 1542 Hz | 2 s | 173.0 s | pareja, media | - |
| musica-084 | MF Doom - Rapp Snitch Knishes [Instrumental].mp3 (duplicado) | COMERCIAL | 95.7 | 4.0 dB | 1542 Hz | 2 s | 173.0 s | pareja, media | - |
| musica-063 | Mr.Kitty - After Dark.mp3 | COMERCIAL | 143.6 | 15.0 dB | 1929 Hz | 32 s | 240.0 s | con subidas, media, intro larga (32 s) | - |
| musica-064 | onlymp3.to - in_this_shirt___the_irrepressibles___tiktok_version__-L5Y9cIBqJis-192k-1708300059.mp3 | COMERCIAL | 152.0 | 2.8 dB | 1457 Hz | 2 s | 240.0 s | pareja, media | - |
| musica-065 | Oppenheimer - Can You Hear The Music.mp3 | COMERCIAL | 136.0 | 16.8 dB | 1717 Hz | 58 s | 103.6 s | muy dinámica, media, intro larga (58 s) | - |
| musica-088 | Phoenix - 1901 (Instrumental) HQ.mp3 | COMERCIAL | 143.6 | 6.9 dB | 2706 Hz | 14 s | 194.3 s | pareja, brillante | - |
| musica-093 | Phoenix - 1901 (Instrumental) HQ.mp3 (duplicado) | COMERCIAL | 143.6 | 6.9 dB | 2706 Hz | 14 s | 194.3 s | pareja, brillante | - |
| musica-096 | RagnBone Man - Human (Official Video).mp3 | COMERCIAL | 152.0 | 11.7 dB | 1691 Hz | 42 s | 197.9 s | con subidas, media, intro larga (42 s) | - |
| musica-089 | Rain - Ryuichi Sakamoto (Studio version).mp3 | COMERCIAL | 86.1 | 7.8 dB | 1161 Hz | 4 s | 214.0 s | pareja, media | - |
| musica-099 | Set Fire To The Rain - Sped up (Tiktok Version).mp3 | COMERCIAL | 129.2 | 9.3 dB | 2635 Hz | 24 s | 202.6 s | con subidas, brillante | - |
| musica-100 | Steve Lacy - Dark Red (Instrumental).mp3 | COMERCIAL | 86.1 | 9.2 dB | 1526 Hz | 14 s | 173.2 s | con subidas, media | - |
| musica-090 | THANK YOU - INSTRUMENTAL - Tyler, The Creator (1).mp3 | COMERCIAL | 152.0 | 9.4 dB | 1455 Hz | 14 s | 99.1 s | con subidas, media | - |
| musica-104 | THANK YOU - INSTRUMENTAL - Tyler, The Creator (1).mp3 (duplicado) | COMERCIAL | 152.0 | 9.4 dB | 1455 Hz | 14 s | 99.1 s | con subidas, media | - |
| musica-105 | The Cinematic Orchestra - To Build a Home There is a house built out of stoneTiktok.mp3 | COMERCIAL | 152.0 | 20.8 dB | 693 Hz | 82 s | 240.0 s | muy dinámica, oscura, intro larga (82 s) | - |
| musica-106 | The Game - Hate It Or Love It (Instrumental).mp3 | COMERCIAL | 99.4 | 11.1 dB | 2237 Hz | 20 s | 207.5 s | con subidas, brillante | - |
| musica-108 | the most beautiful outro (Dragonfly by Dana and Alden).mp3 | COMERCIAL | 136.0 | 10.7 dB | 1277 Hz | 14 s | 79.8 s | con subidas, media | - |
| musica-110 | The Weeknd - After Hours (Audio) (320).mp3 | COMERCIAL | 107.7 | 9.0 dB | 1904 Hz | 44 s | 240.0 s | con subidas, media, intro larga (44 s) | - |
| musica-111 | Tings - Baby Smoove Instrumental (ReProd. bryce).mp3 | COMERCIAL | 112.3 | 8.1 dB | 2669 Hz | 24 s | 146.5 s | con subidas, brillante | - |
| musica-112 | tom odell - another love (slowed down) (1).mp3 | COMERCIAL | 107.7 | 18.2 dB | 1261 Hz | 120 s | 240.0 s | muy dinámica, media, intro larga (120 s) | - |
| musica-113 | Tommy Richman - Million Dollar Baby [Instrumental].mp3 | COMERCIAL | 92.3 | 11.7 dB | 1141 Hz | 2 s | 155.2 s | con subidas, media | - |
| musica-114 | tomp3.cc - Red Silhouette challenge  put your head on my shoulder x streets lyrics TikTok Remix.mp3 | COMERCIAL | 89.1 | 1.7 dB | 1826 Hz | 12 s | 228.3 s | pareja, media | - |
| musica-115 | TV_girl_-_lovers_rock_instrumental.mp3 | COMERCIAL | 103.4 | 2.8 dB | 2194 Hz | 2 s | 207.3 s | pareja, brillante | - |
| musica-124 | Y2meta.app - ALL TIME LOW - Jon Bellion (Version SAD) [Lyring] (320 kbps).mp3 | COMERCIAL | 99.4 | 9.2 dB | 1198 Hz | 10 s | 159.6 s | con subidas, media | - |
| musica-125 | Y2meta.app - Dana and Alden Dragonfly _ Slowed&Reverb _ 𝖙𝖔 𝖕𝖊𝖗𝖋𝖊𝖈𝖙𝖎𝖔𝖓 (128 kbps).mp3 | COMERCIAL | 112.3 | 11.9 dB | 1000 Hz | 16 s | 108.0 s | con subidas, media | - |
| musica-126 | Y2meta.app - enemy - imagine dragons x j.i.d [edit audio] (128 kbps).mp3 | COMERCIAL | 143.6 | 17.5 dB | 2556 Hz | 12 s | 52.0 s | muy dinámica, brillante | - |
| musica-129 | Yann Tiersen - Comptine d_un autre été (Amélie).mp3 | COMERCIAL | 172.3 | 27.7 dB | 566 Hz | 6 s | 190.0 s | muy dinámica, oscura | - |
| musica-130 | Yeat - bigger than everything (INSTRUMENTAL) Prod.BNYX.mp3 | COMERCIAL | 99.4 | 17.9 dB | 955 Hz | 14 s | 220.1 s | muy dinámica, media | - |
| musica-131 | Yeat - Money So Big Instrumental.mp3 | COMERCIAL | 123.0 | 11.3 dB | 2108 Hz | 2 s | 209.4 s | con subidas, brillante | - |
| musica-132 | Young Folks Instrumentals.mp3 | COMERCIAL | 136.0 | 4.6 dB | 2701 Hz | 8 s | 240.0 s | pareja, brillante | - |
