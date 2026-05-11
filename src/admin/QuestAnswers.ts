/* ============================================================
   📋 KOMPLETNA BAZA ODPOWIEDZI DO WSZYSTKICH QUESTÓW
   Używane w admin panelu jako cheatsheet
   ============================================================ */

export interface QuestAnswer {
  questId: number;
  questTitle: string;
  taskNumber: number;
  taskType: string;
  question: string;
  answer: string | string[];
  hint?: string;
  memoryKey?: string;
  fragment?: string;
}

export const QUEST_ANSWERS: QuestAnswer[] = [

  /* ============= QUEST 1 — INTRO ============= */
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 1, taskType: 'welcome',
    question: 'Welcome screen',
    answer: '[Click START]',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 2, taskType: 'name_input',
    question: 'Wprowadź ksywkę',
    answer: '2-12 znaków [a-zA-Z0-9_-]',
    memoryKey: 'player_name',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 3, taskType: 'avatar_select',
    question: 'Wybierz awatar',
    answer: '🌽 / 🦊 / 🦉 / 🐺 / 🦅 / 🐉 / 🦁 / 🐯 / 🦄',
    memoryKey: 'player_avatar',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 4, taskType: 'boot',
    question: 'Boot sequence',
    answer: '[Auto - czekaj]',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 5, taskType: 'observation',
    question: 'Ile ŻÓŁTYCH tabliczek widzisz przy wejściu?',
    answer: '3',
    hint: 'Obróć się 360° przy wejściu głównym',
    memoryKey: 'q1_yellow_signs',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 6, taskType: 'physical',
    question: 'Skan NFC',
    answer: '[Tap NFC point]',
  },
  {
    questId: 1, questTitle: 'Inicjalizacja Systemu',
    taskNumber: 7, taskType: 'code_input',
    question: 'Wpisz 2-cyfrowy kod z odwrotu tabliczki NFC',
    answer: '37',
    memoryKey: 'q1_start_code',
    fragment: '37 (digits)',
  },

  /* ============= QUEST 2 — NFC TUTORIAL ============= */
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 1, taskType: 'observation',
    question: 'Kierunek czerwonej flagi',
    answer: 'E (East/Wschód)',
    memoryKey: 'q2_compass',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 2, taskType: 'physical',
    question: 'Zeskanuj 3 punkty NFC',
    answer: 'Alpha (⚡) + Beta (🔴) + Gamma (📦)',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 3, taskType: 'quiz',
    question: 'Które zdanie o NFC jest FAŁSZYWE?',
    answer: 'NFC wymaga baterii w tagu (opcja 2)',
    hint: 'Tagi NFC są pasywne',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 4, taskType: 'memory',
    question: 'Sekwencja kolorów',
    answer: '[Losowa - 5 kolorów RGBY]',
    memoryKey: 'q2_color_sequence',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 5, taskType: 'puzzle',
    question: 'Kalibracja sygnału ±5%',
    answer: '70-80%',
    memoryKey: 'q2_calibration',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 6, taskType: 'puzzle',
    question: 'Łap sygnał w zielonej strefie',
    answer: '70-80% (zielona strefa)',
    memoryKey: 'q2_signal_locked',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 7, taskType: 'physical',
    question: 'Kod z UKRYTEJ tabliczki w lewym rogu',
    answer: '4821',
    hint: 'Lewy róg, wysokość kolan, przy ogrodzeniu',
    memoryKey: 'q2_hidden_panel_code',
  },
  {
    questId: 2, questTitle: 'Trening NFC',
    taskNumber: 8, taskType: 'fragment',
    question: 'Fragment koloru',
    answer: 'RED',
    memoryKey: 'q2_color',
    fragment: 'RED (color)',
  },

  /* ============= QUEST 3 — QUIZ ============= */
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 1, taskType: 'quiz',
    question: 'W którym kraju jest Zator?',
    answer: 'Polska (opcja 2)',
  },
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 2, taskType: 'quiz',
    question: 'Ile rzędów ziaren ma kolba kukurydzy?',
    answer: '14-20 (opcja 2)',
  },
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 3, taskType: 'observation',
    question: 'Kolor największej tabliczki przy wejściu',
    answer: 'Żółta (opcja 2)',
  },
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 4, taskType: 'backref',
    question: 'Wpisz kod z Q1 (z odwrotu tabliczki NFC)',
    answer: '37',
    hint: 'Wróć do Q1 Task 7',
  },
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Liczba żółtych tabliczek (z Q1)',
    answer: '3',
    memoryKey: 'q1_yellow_signs',
  },
  {
    questId: 3, questTitle: 'Quiz Labiryntowy',
    taskNumber: 6, taskType: 'fragment',
    question: 'Fragment słowo',
    answer: 'CORN',
    memoryKey: 'q3_quiz_word',
    fragment: 'CORN (word)',
  },

  /* ============= QUEST 4 — PUZZLE ============= */
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 1, taskType: 'observation',
    question: 'Policz znaczniki (czerwone/żółte/zielone)',
    answer: 'Red: 4, Yellow: 7, Green: 3',
    memoryKey: 'q4_dominant_color → YELLOW',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 2, taskType: 'puzzle',
    question: 'Stabilizacja przepływu (3 levele rotacji)',
    answer: '[Rotacja 3-elementowych okien do [1,2,3,4,5,6]]',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 3, taskType: 'puzzle',
    question: 'Przejdź mini-labirynt 5x5',
    answer: 'Zbierz min. 1 klucz, dotrzyj do [4,4]',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 4, taskType: 'puzzle',
    question: 'Wzór Fibonacci: 1,1,2,3,5,8,13,?,?,?',
    answer: '21, 34, 55',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 5, taskType: 'backref',
    question: 'Kolor z Quest 2',
    answer: 'RED',
    memoryKey: 'q2_color',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 6, taskType: 'puzzle',
    question: 'Połącz przewody kolorystycznie',
    answer: 'R→R, Y→Y, G→G, B→B',
  },
  {
    questId: 4, questTitle: 'Labirynt Sygnałów',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment symbol',
    answer: '⚡',
    fragment: '⚡ (symbol)',
  },

  /* ============= QUEST 5 — MEMORY ============= */
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 1, taskType: 'physical',
    question: '5 przedmiotów na stole',
    answer: 'Min. 4 wpisane',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 2, taskType: 'puzzle',
    question: 'Memory grid (6 par + 2 decoy)',
    answer: 'Znajdź 6 par. Decoy: ⚠️ ❓',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 3, taskType: 'memory',
    question: 'Simon Says (3 rundy)',
    answer: '[Losowa sekwencja 4-6 kolorów]',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 4, taskType: 'memory',
    question: 'Number sequence (3 rundy)',
    answer: '[Losowa sekwencja 3-5 cyfr]',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 5, taskType: 'memory',
    question: 'Spatial pattern 4x4',
    answer: '[Losowy wzór 5 komórek]',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 6, taskType: 'memory_lock',
    question: 'Liczba rzędów z Q7',
    answer: '8',
    memoryKey: 'q7_row_count',
  },
  {
    questId: 5, questTitle: 'Pamięć Sieci',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment cyfry',
    answer: '58',
    fragment: '58 (digits)',
  },

  /* ============= QUEST 6 — SPEED ============= */
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 1, taskType: 'reaction',
    question: 'Test reakcji 3x',
    answer: 'Średnia < 800ms',
  },
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 2, taskType: 'whack',
    question: 'Whack-a-mole (20 sek)',
    answer: 'Min. 8 trafień, max 4 chybienia',
  },
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 3, taskType: 'memory',
    question: 'Sekwencja pod presją czasu',
    answer: '[3 rundy, 3-5 cyfr każda]',
  },
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 4, taskType: 'speed',
    question: 'Color match (5 rund, 2 sek/runda)',
    answer: '5/5 trafień',
  },
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 5, taskType: 'jump',
    question: 'Przeskok do Q11',
    answer: '[Click JUMP]',
  },
  {
    questId: 6, questTitle: 'Refleks Reaktora',
    taskNumber: 6, taskType: 'fragment',
    question: 'Fragment kolor',
    answer: 'BLUE',
    fragment: 'BLUE (color)',
  },

  /* ============= QUEST 7 — CODE ============= */
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 1, taskType: 'observation',
    question: 'Liczba rzędów kukurydzy',
    answer: '8 (zakres 6-10)',
    memoryKey: 'q7_row_count',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 2, taskType: 'observation',
    question: 'Symbol nad przejściem',
    answer: 'A (🌽)',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 3, taskType: 'physical',
    question: 'Liczba czerwonych znaczników',
    answer: '5',
    memoryKey: 'q7_red_markers',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 4, taskType: 'backref',
    question: 'Kod z lewego rogu Q2',
    answer: '4821',
    hint: 'Quest 2 — Task 7',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Dominujący kolor z Q4',
    answer: 'YELLOW',
    memoryKey: 'q4_dominant_color',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 6, taskType: 'jump',
    question: 'Przeskok do Q11 (Hub Logiczny)',
    answer: '[Click JUMP]',
  },
  {
    questId: 7, questTitle: 'Kod w Kukurydzy',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment cyfry',
    answer: '4821',
    fragment: '4821 (digits)',
  },

  /* ============= QUEST 8 — HIDDEN ============= */
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 1, taskType: 'observation',
    question: 'Znajdź 5 ukrytych punktów',
    answer: 'Litery: O-M-E-G-A',
    memoryKey: 'q8_hidden_word → OMEGA',
  },
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 2, taskType: 'cipher',
    question: 'Szyfr Cezara: RPHJD (przesunięcie -3)',
    answer: 'OMEGA',
    hint: 'R→O, P→M, H→E, J→G, D→A',
  },
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 3, taskType: 'frequency',
    question: 'Tuning częstotliwości',
    answer: '783 Hz (±10)',
    memoryKey: 'q8_frequency',
  },
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 4, taskType: 'konami',
    question: 'Tajny kod ruchów',
    answer: '↑↑↓↓←→←→',
    hint: 'Klasyk gier Konami',
  },
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Słowo z Q3',
    answer: 'CORN',
    memoryKey: 'q3_quiz_word',
  },
  {
    questId: 8, questTitle: 'Ukryty Sygnał',
    taskNumber: 6, taskType: 'fragment',
    question: 'Fragment klucz',
    answer: 'OMEGA',
    fragment: 'OMEGA (key)',
  },

  /* ============= QUEST 9 — DECISION ============= */
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 1, taskType: 'memory_lock',
    question: 'Słowo Q3 + kolor Q6',
    answer: 'CORNBLUE',
    hint: 'Bez spacji: CORN+BLUE',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 2, taskType: 'decision',
    question: 'Spotkanie z graczem',
    answer: 'Wybór: helper/explorer/rogue',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 3, taskType: 'decision',
    question: 'Tabliczka z kodem',
    answer: 'Wybór: helper/explorer/rogue',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 4, taskType: 'decision',
    question: 'Tajne przejście',
    answer: 'Wybór: helper/explorer/rogue',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 5, taskType: 'analysis',
    question: 'Analiza wyborów',
    answer: '[Auto - czekaj]',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 6, taskType: 'identity',
    question: 'Twoja tożsamość',
    answer: 'Dominujący path: HELPER/EXPLORER/ROGUE',
  },
  {
    questId: 9, questTitle: 'Ścieżka Przeznaczenia',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment symbol',
    answer: '🌽',
    fragment: '🌽 (symbol)',
  },

  /* ============= QUEST 10 — TRAP ============= */
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 1, taskType: 'trap',
    question: 'Test chciwości (4 opcje)',
    answer: '🚪 IDŹ DALEJ (opcja 3)',
    hint: 'Tylko bezpieczna opcja',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 2, taskType: 'patience',
    question: 'NIE klikaj 10 sekund',
    answer: 'Czekaj do końca!',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 3, taskType: 'trap',
    question: 'Wybór drzwi (3 opcje)',
    answer: 'B (proste, bez ozdób)',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 4, taskType: 'reverse',
    question: 'System mówi: WYBIERZ A',
    answer: 'B (psychologia odwrotna!)',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Kod z Q5',
    answer: '58',
    memoryKey: 'q5_code',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 6, taskType: 'patience',
    question: 'NIE klikaj 5 sekund',
    answer: 'NIC nie klikaj!',
  },
  {
    questId: 10, questTitle: 'Strefa Pułapek',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment słowo',
    answer: 'TRAP',
    fragment: 'TRAP (word)',
  },

  /* ============= QUEST 11 — MATH HUB ============= */
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 1, taskType: 'math',
    question: 'Łańcuch obliczeń (3 problemy)',
    answer: '64 → 16 → 15',
    hint: '7×8+12-4 / (15+9)÷3×2 / √144+2³-5',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 2, taskType: 'logic',
    question: '(A AND B) OR C = TRUE',
    answer: 'C=TRUE (najprościej) lub A=B=TRUE',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 3, taskType: 'logic',
    question: 'Tabela prawdy NOT(A) AND (B OR C)',
    answer: '3 (TRUE results)',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 4, taskType: 'sort',
    question: 'Sortowanie malejąco',
    answer: '9 8 7 5 4 2 1',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 5, taskType: 'math',
    question: 'Zbuduj wyrażenie = 42',
    answer: 'np. 6×7 lub (5+9)×3',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 6, taskType: 'backref',
    question: 'Reakcja Q6 + znaczniki Q7',
    answer: '<reaction>-5 (np. 450-5)',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 7, taskType: 'jump',
    question: 'Przeskok do Q13',
    answer: '[Click JUMP]',
  },
  {
    questId: 11, questTitle: 'Hub Logiczny',
    taskNumber: 8, taskType: 'fragment',
    question: 'Fragmenty (2x)',
    answer: '99 (digits) + GREEN (color)',
    fragment: '99 + GREEN',
  },

  /* ============= QUEST 12 — PATTERN ============= */
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 1, taskType: 'morse',
    question: 'Morse: -- .- --.. .',
    answer: 'MAZE',
    hint: '4 litery, gra-related',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 2, taskType: 'cipher',
    question: 'Cezar UVTLY shift 7',
    answer: 'NOTER',
    hint: 'Cofnij każdą literę o 7',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 3, taskType: 'puzzle',
    question: 'Połącz rury start→end',
    answer: '[Obracaj rury aż połączysz [0,0] z [3,3]]',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 4, taskType: 'pattern',
    question: 'Wzór swipe (L-shape)',
    answer: 'Pozycje: 0→1→2→5→8',
    hint: 'Litera L na siatce 3x3',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Klucz z Q8',
    answer: 'OMEGA',
    memoryKey: 'q8_key',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 6, taskType: 'memory_lock',
    question: 'Kolor z Q11',
    answer: 'GREEN',
    memoryKey: 'q11_color',
  },
  {
    questId: 12, questTitle: 'Wieża Wzorców',
    taskNumber: 7, taskType: 'fragment',
    question: 'Fragment symbol',
    answer: '🔮',
    fragment: '🔮 (symbol)',
  },

  /* ============= QUEST 13 — TIMED ============= */
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 1, taskType: 'compass',
    question: 'Kompas → ZACHÓD',
    answer: '270° (W)',
    hint: 'Trzymaj telefon na zachód',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 2, taskType: 'frequency',
    question: 'Częstotliwość 783 Hz',
    answer: '783 ±10 Hz',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 3, taskType: 'circuit',
    question: 'Połącz piny kolorystycznie',
    answer: 'R→R, B→B, G→G, Y→Y',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 4, taskType: 'math',
    question: 'Wyrażenie = 256 (cyfry 2,4,8)',
    answer: '4×8×8 lub 2×8×8×2 lub 8×8×4',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 5, taskType: 'memory_lock',
    question: 'Klucz z Q8',
    answer: 'OMEGA',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 6, taskType: 'memory_lock',
    question: 'Cyfry z Q11',
    answer: '99',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 7, taskType: 'confirm',
    question: 'Potwierdź gotowość',
    answer: '[Click CONTINUE]',
  },
  {
    questId: 13, questTitle: 'Korytarz Finałowy',
    taskNumber: 8, taskType: 'fragment',
    question: 'Fragment cyfry',
    answer: '7531',
    fragment: '7531 (digits)',
  },

  /* ============= QUEST 14 — FINAL GATE ============= */
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 1, taskType: 'sequence',
    question: 'Kod mistrza',
    answer: '1 → 3 → 2 → 4',
  },
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 2, taskType: 'multikey',
    question: 'Trzymaj klawisze A + C + E',
    answer: 'A, C, E (BEZ B i D)',
  },
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 3, taskType: 'pattern',
    question: 'Wzór klepsydry',
    answer: '0→2→4→6→8→4 (X shape)',
  },
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 4, taskType: 'memory_lock',
    question: 'Symbol z Q12',
    answer: '🔮',
    memoryKey: 'q12_symbol',
  },
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 5, taskType: 'review',
    question: 'Przegląd fragmentów',
    answer: 'Min. 5 fragmentów',
  },
  {
    questId: 14, questTitle: 'Brama Finałowa',
    taskNumber: 6, taskType: 'fragment',
    question: 'Klucz finałowy',
    answer: 'GATE',
    fragment: 'GATE (key)',
  },

  /* ============= QUEST 15 — META BOSS ============= */
  {
    questId: 15, questTitle: 'Meta Boss',
    taskNumber: 1, taskType: 'verify',
    question: 'Weryfikacja fragmentów',
    answer: 'Wszystkie 5 fragmentów zebrane',
  },
  {
    questId: 15, questTitle: 'Meta Boss',
    taskNumber: 2, taskType: 'final_code',
    question: 'Kod finałowy',
    answer: '37-4821-🔮-58-GATE',
    hint: 'Q1-Q7-Q12-Q5-Q14',
  },
  {
    questId: 15, questTitle: 'Meta Boss',
    taskNumber: 3, taskType: 'boss',
    question: 'Walka z bossem (3+ rund)',
    answer: 'Powtórz sekwencję ATTACK/DEFEND/COUNTER/DODGE',
  },
  {
    questId: 15, questTitle: 'Meta Boss',
    taskNumber: 4, taskType: 'morse',
    question: 'Morse strażnika',
    answer: 'HOPE',
  },
  {
    questId: 15, questTitle: 'Meta Boss',
    taskNumber: 5, taskType: 'cipher',
    question: 'Cezar ZHHK shift 19',
    answer: 'GOOD',
  },
  {
    questId: 15, questTitle: 'Meta Boss',
    