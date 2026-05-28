import { useState, useEffect, useMemo } from "react";

interface Party {
  code: string;
  name: string;
  color: string;
  logo: string;
  emoji: string;
  leader: string;
  descr: string;
}

interface Section {
  id: string;
  label: string;
}

interface Question {
  n: number;
  sec: string;
  text: string;
  detail: string;
}

interface Archetype {
  name: string;
  desc: string;
  party: string;
}

interface Axis {
  label: string;
  opposite: string;
  qs: number[];
  score?: number;
}

const PARTIES: Party[] = [
  { code: "ER",   name: "Единая Россия", color: "#1e40af", logo: "image_cbe060.png", emoji: "🐻", leader: "Дмитрий Медведев", descr: "Консервативная партия власти. Приоритеты: стабильность, порядок, суверенитет." },
  { code: "KPRF", name: "КПРФ", color: "#dc2626", logo: "image_cbe32b.jpg", emoji: "☭", leader: "Геннадий Зюганов", descr: "Левая оппозиция. За национализацию, социальное равенство и советские стандарты." },
  { code: "LDPR", name: "ЛДПР", color: "#eab308", logo: "image_cbe363.png", emoji: "🦅", leader: "Леонид Слуцкий", descr: "Национал-популизм. Жёсткая внешняя политика, поддержка армии и ограничение миграции." },
  { code: "NL",   name: "Новые люди", color: "#0d9488", logo: "image_cbeae9.jpg", emoji: "🌿", leader: "Алексей Нечаев", descr: "Либеральный центр. Поддержка бизнеса, обновление элит и цифровизация." },
  { code: "SR",   name: "Справедливая Россия", color: "#7c3aed", logo: "image_cbeac7.jpg", emoji: "⚖️", leader: "Сергей Миронов", descr: "Социал-демократия. Справедливое распределение благ и патриотизм." },
  { code: "YAB",  name: "Яблоко", color: "#16a34a", logo: "image_cc4505.png", emoji: "🍏", leader: "Николай Рыбаков", descr: "Либеральная оппозиция. Права человека, европейский путь и свобода слова." },
  { code: "RPPS", name: "Партия Пенсионеров", color: "#9a3412", logo: "image_cbeb67.png", emoji: "🧓", leader: "Владимир Ворожцов", descr: "Социальный патернализм. Защита интересов старшего поколения и качественная медицина." },
  { code: "KR",   name: "Коммунисты России", color: "#b91c1c", logo: "image_cbeb88.jpg", emoji: "🚩", leader: "Сергей Малинкович", descr: "Радикальные левые. Возврат к плановой экономике и идеям Ленина." },
  { code: "ZEL",  name: "РЭП Зелёные", color: "#22c55e", logo: "image_cc44e2.png", emoji: "🌱", leader: "Андрей Нагибин", descr: "Экология. Зелёные технологии и жесткая защита окружающей среды." },
  { code: "ROD",  name: "Партия Родина", color: "#475569", logo: "image_cbeb07.jpg", emoji: "⚔️", leader: "Алексей Журавлёв", descr: "Национал-консерватизм. Военная мощь и жёсткий государственный суверенитет." },
  { code: "PPD",  name: "Партия прямой демократии", color: "#0284c7", logo: "image_cc4523.jpg", emoji: "📱", leader: "Олег Артамонов", descr: "Технократия. Цифровое управление, электронное голосование и блокчейн-демократия." },
  { code: "GP",   name: "Гражданская Платформа", color: "#d97706", logo: "image_cbeb24.png", emoji: "💼", leader: "Рифат Шайхутдинов", descr: "Бизнес-консерватизм. Экономическая свобода предпринимательства при лояльности государству." }
];

const SECTIONS: Section[] = [
  { id: "I",    label: "Государство и власть" },
  { id: "II",   label: "Экономика" },
  { id: "III",  label: "Социальная политика" },
  { id: "IV",   label: "Армия и безопасность" },
  { id: "V",    label: "Интернет и цифровой контроль" },
  { id: "VI",   label: "Культура и ценности" },
  { id: "VII",  label: "Внешняя политика" },
  { id: "VIII", label: "Экология и технологии" },
  { id: "IX",   label: "Миграция и национальный вопрос" },
  { id: "X",    label: "Личное мировоззрение" },
];

const MATRIX: Record<number, number[]> = {
  1:  [5,4,5,2,4,1, 4,4,4,5,2,4], 2:  [2,5,3,4,4,5, 3,4,3,2,5,4], 3:  [2,3,2,4,3,5, 4,2,4,2,5,4],
  4:  [5,4,5,2,4,1, 4,5,3,5,2,4], 5:  [2,4,2,5,3,5, 3,2,3,1,4,3], 6:  [4,2,4,1,3,1, 3,5,3,5,2,4],
  7:  [5,2,4,3,2,1, 4,2,4,5,5,4], 8:  [2,3,2,4,3,5, 3,4,3,2,4,3], 9:  [3,5,4,4,5,4, 5,5,5,4,5,5],
  10: [1,3,2,5,3,5, 2,3,3,1,4,3], 11: [3,5,4,2,5,4, 5,5,4,4,3,2], 12: [2,5,4,1,4,1, 5,5,4,4,2,2], 
  13: [3,2,3,5,3,4, 4,3,5,4,5,5], 14: [2,4,3,5,3,4, 3,2,4,2,5,5], 15: [5,5,4,2,4,2, 5,5,4,5,3,3], 
  16: [3,5,4,2,5,3, 5,5,4,4,3,3], 17: [4,2,3,5,3,5, 2,1,4,3,5,5], 18: [3,5,4,2,5,2, 5,5,3,4,2,2], 
  19: [4,5,4,2,4,2, 4,5,3,4,3,3], 20: [5,4,5,2,4,2, 5,5,4,5,3,4], 21: [4,5,3,3,5,4, 5,5,4,4,3,3], 
  22: [2,5,4,2,5,3, 5,5,4,4,3,3], 23: [5,4,5,4,5,3, 5,5,5,5,4,4], 24: [3,4,2,5,3,5, 3,4,4,2,5,4], 
  25: [5,4,5,2,4,2, 4,5,4,5,3,4], 26: [3,2,3,5,3,4, 3,1,4,3,5,5], 27: [2,5,3,1,4,2, 5,5,4,4,2,2], 
  28: [5,4,5,3,5,3, 5,5,5,5,4,4], 29: [3,5,4,3,5,4, 5,5,4,4,4,3], 30: [4,5,3,3,5,4, 5,5,4,4,3,3],
  31: [5,4,5,3,4,1, 4,5,4,5,3,4], 32: [4,4,4,4,4,3, 3,2,4,3,5,4], 33: [5,4,5,3,4,2, 4,5,3,5,3,4],
  34: [5,3,5,2,3,1, 5,5,4,5,4,5], 35: [1,2,1,4,2,5, 2,1,3,1,4,2], 36: [5,4,5,3,4,2, 3,5,3,5,2,4],
  37: [5,4,5,2,4,1, 4,5,4,5,3,4], 38: [5,5,5,4,5,3, 5,5,4,5,4,4], 39: [4,4,5,2,4,1, 4,5,3,5,3,4],
  40: [2,2,2,4,3,5, 3,2,4,1,5,3], 41: [5,3,4,1,3,1, 4,5,3,5,2,3], 42: [5,4,5,2,4,1, 4,5,4,5,2,4], 
  43: [5,3,4,1,3,1, 3,5,3,5,2,3], 44: [5,4,4,4,4,3, 4,4,5,4,5,5], 45: [4,4,4,2,3,2, 3,4,3,4,2,3], 
  46: [5,4,5,2,4,1, 4,5,4,5,2,4], 47: [1,3,2,5,3,5, 2,1,3,1,5,3], 48: [2,3,2,5,3,5, 2,1,3,1,5,3], 
  49: [5,3,4,2,3,1, 4,5,4,5,5,4], 50: [5,4,4,5,4,4, 4,5,4,4,3,3], 51: [5,3,5,1,4,1, 4,3,3,5,2,4], 
  52: [2,4,2,5,3,5, 4,5,4,5,3,4], 53: [5,3,4,2,3,1, 4,5,4,5,3,4], 54: [5,4,5,2,4,1, 4,5,3,5,2,3], 
  55: [4,3,5,2,3,2, 3,5,4,2,5,4], 56: [5,3,5,1,3,1, 4,5,3,5,3,3], 57: [4,5,4,2,4,2, 5,5,4,5,4,4], 
  58: [5,4,5,2,4,1, 4,5,4,5,3,4], 59: [3,4,3,4,3,4, 4,4,5,3,4,4], 60: [5,4,5,3,4,2, 4,5,4,5,3,4],
  61: [5,4,4,4,4,3, 5,5,5,5,4,5], 62: [2,2,1,5,2,5, 2,1,3,1,4,3], 63: [5,4,5,2,4,1, 4,5,3,5,3,4],
  64: [2,3,2,5,3,5, 3,2,4,1,4,3], 65: [5,4,5,3,4,2, 5,5,4,5,3,4], 66: [4,3,5,2,3,1, 5,5,4,5,3,5],
  67: [2,2,1,5,3,5, 3,1,4,1,5,3], 68: [5,4,5,2,4,1, 5,5,4,5,3,4], 69: [2,2,1,4,3,5, 2,1,3,1,4,3],
  70: [5,4,5,3,4,2, 4,5,4,5,4,4], 71: [3,4,2,5,4,5, 4,4,5,2,4,3], 72: [2,3,1,4,3,5, 4,3,5,2,5,4], 
  73: [5,5,5,4,5,3, 4,5,4,5,4,4], 74: [4,4,2,5,4,5, 5,5,5,4,5,4], 75: [3,3,1,5,3,5, 3,4,2,5,2,3], 
  76: [5,4,5,2,4,1, 4,5,4,5,4,4], 77: [5,3,4,5,4,4, 4,5,4,5,4,4], 78: [3,3,3,5,3,4, 4,3,5,3,4,4], 
  79: [5,5,4,5,4,4, 4,5,4,5,5,4], 80: [3,4,3,4,4,4, 4,4,4,4,5,5], 81: [4,4,5,2,4,1, 5,4,4,5,3,4], 
  82: [4,2,2,5,3,4, 4,5,5,3,4,4], 83: [5,5,5,3,5,3, 5,5,4,5,4,4], 84: [5,4,3,5,4,5, 5,5,4,5,3,4], 
  85: [4,4,5,2,4,1, 5,5,4,5,4,4], 86: [5,4,5,3,4,2, 4,3,3,5,3,3], 87: [3,2,1,5,3,5, 4,5,5,3,4,4], 
  88: [4,4,5,3,4,3, 4,3,3,5,2,4], 89: [4,4,5,2,4,2, 4,3,3,5,3,4], 90: [4,3,5,3,3,2, 5,5,4,5,4,4],
  91: [5,4,5,2,4,2, 3,5,3,5,2,3], 92: [2,2,1,5,3,5, 3,2,4,2,5,4], 93: [3,5,3,2,5,4, 5,5,4,5,4,4],
  94: [5,5,5,2,4,1, 5,5,4,5,3,4], 95: [5,4,5,2,4,1, 5,5,5,5,4,4], 96: [2,4,3,5,3,5, 2,1,3,3,5,5],
  97: [5,3,4,5,4,4, 4,5,3,5,3,4], 98: [5,4,5,3,4,2, 5,5,4,5,5,5], 99: [2,4,2,5,3,5, 5,5,4,5,4,3],
  100:[2,2,1,5,3,5, 2,1,3,1,4,2],
};

const ALL_QUESTIONS: Question[] = [
  { n:1,  sec:"I",  text:"Президенту нужно дать больше полномочий.", detail:"Баланс исполнительной власти. ЕР поддерживает сильную президентскую вертикаль, оппозиция считает её избыточной." },
  { n:2,  sec:"I",  text:"Парламент в России слишком слабый.", detail:"Роль Государственной Думы и реальное влияние народных представителей на государственную политику." },
  { n:3,  sec:"I",  text:"Губернаторов нужно избирать максимально независимо.", detail:"Федерализм против централизованного управления. Прямые выборы без жесткого муниципального фильтра." },
  { n:4,  sec:"I",  text:"Сильная вертикаль власти важнее региональной автономии.", detail:"Приоритет централизации как гаранта территориальной целостности государства." },
  { n:5,  sec:"I",  text:"Политическая оппозиция должна иметь больше возможностей.", detail:"Конкуренция на выборах, честный доступ к СМИ, развитие многопартийности." },
  { n:6,  sec:"I",  text:"Государство должно жёстко бороться с протестами.", detail:"Приоритет общественного порядка над правом граждан на мирные собрания." },
  { n:7,  sec:"I",  text:"Электронное голосование повышает доверие к выборам.", detail:"Оценка надежности ДЭГ. Лоялисты видят удобство, оппозиция сомневается в прозрачности." },
  { n:8,  sec:"I",  text:"Судебная система недостаточно независима.", detail:"Вопрос независимости судей и разделения властей." },
  { n:9,  sec:"I",  text:"Чиновникам нужно ограничить роскошь законодательно.", detail:"Популярная антикоррупционная мера контроля расходов и публичного потребления чиновников." },
  { n:10, sec:"I",  text:"Сроки пребывания у власти должны быть ограничены строже.", detail:"Принципиальная сменяемость власти как защита от монополии элит." },
  { n:11, sec:"II", text:"Крупные компании должны платить больше налогов.", detail:"Прогрессивное налогообложение крупных корпораций и сверхдоходов." },
  { n:12, sec:"II", text:"Приватизация 1990-х была ошибкой.", detail:"Легитимность рыночного перехода. Коммунисты за деприватизацию, новые правые за незыблемость частной собственности." },
  { n:13, sec:"II", text:"Малому бизнесу нужно резко снизить налоги.", detail:"Стимулирование предпринимательства, снижение проверок и барьеров." },
  { n:14, sec:"II", text:"Государственные корпорации слишком раздуты.", detail:"Доминирование госмонополий тормозит свободную рыночную конкуренцию." },
  { n:15, sec:"II", text:"Стратегические отрасли должны контролироваться государством.", detail:"Энергетика, оборонный сектор и ЖКХ под непосредственным госуправлением." },
  { n:16, sec:"II", text:"Нужно повышать МРОТ даже под риском инфляции.", detail:"Борьба с бедностью за счет повышенных требований к работодателям." },
  { n:17, sec:"II", text:"Рыночная экономика — лучший путь развития России.", detail:"Принципиальный спор: свободный рынок против государственного планирования." },
  { n:18, sec:"II", text:"Государство должно ограничивать цены на базовые товары.", detail:"Государственное регулирование цен на еду, топливо и лекарства." },
  { n:19, sec:"II", text:"Центробанк должен быть менее независимым.", detail:"Подчинение регулятора целям правительства ради дешевых кредитов для промышленности." },
  { n:20, sec:"II", text:"Импортозамещение полезно для страны.", detail:"Стимулирование внутреннего производства в условиях санкционного давления." },
  { n:21, sec:"III", text:"Нужно увеличить пособия малоимущим.", detail:"Прямая финансовая помощь беднейшим слоям населения со стороны бюджета." },
  { n:22, sec:"III", text:"Пенсионный возраст стоит снизить.", detail:"Откат пенсионной реформы 2018 года. Левые и социал-патерналисты настаивают на снижении." },
  { n:23, sec:"III", text:"Государство должно больше поддерживать семьи с детьми.", detail:"Увеличение материнского капитала, льгот и семейных пособий." },
  { n:24, sec:"III", text:"Аборт должен оставаться легальным.", detail:"Право женщины на репродуктивный выбор. Консерваторы выступают за жесткие ограничения." },
  { n:25, sec:"III", text:"Школа должна воспитывать патриотизм.", detail:"Активная идеологическая и патриотическая работа в образовательных учреждениях." },
  { n:26, sec:"III", text:"Частные школы — нормальная альтернатива государственным.", detail:"Возможность платного альтернативного образования в конкурентной среде." },
  { n:27, sec:"III", text:"Нужно вернуть больше советских социальных гарантий.", detail:"Запрос на бесплатное распределение жилья, гарантированное трудоустройство и путевки." },
  { n:28, sec:"III", text:"Государство должно поддерживать рождаемость финансово.", detail:"Экономическое стимулирование рождаемости ради преодоления демографического кризиса." },
  { n:29, sec:"III", text:"Бедность — главная проблема России.", detail:"Приоритет борьбы с бедностью и неравенством перед внешнеполитическими задачами." },
  { n:30, sec:"III", text:"Богатые регионы должны больше помогать бедным.", detail:"Налоговое выравнивание бюджетов субъектов РФ." },
  { n:31, sec:"IV", text:"Военные расходы оправданы нынешней ситуацией.", detail:"Текущий масштаб финансирования ОПК и силовых ведомств." },
  { n:32, sec:"IV", text:"Армия должна быть преимущественно контрактной.", detail:"Профессиональные вооруженные силы против обязательной воинской повинности по призыву." },
  { n:33, sec:"IV", text:"В России нужно усиливать внутреннюю безопасность.", detail:"Увеличение финансирования спецслужб, расширение полномочий правоохранительных органов." },
  { n:34, sec:"IV", text:"Ядерное сдерживание — основа безопасности России.", detail:"Оценка роли ядерного щита как главного гаранта суверенности государства." },
  { n:35, sec:"IV", text:"России нужно сократить военные расходы ради социальных нужд.", detail:"Альтернатива развития: перераспределение средств оборонки на медицину и школы." },
  { n:36, sec:"IV", text:"Силовые структуры должны иметь широкие полномочия.", detail:"Расширение возможностей ведомств ради быстрого пресечения угроз." },
  { n:37, sec:"IV", text:"Патриотическое воспитание молодёжи через армию — правильно.", detail:"Деятельность Юнармии, НВП и военно-патриотических лагерей." },
  { n:38, sec:"IV", text:"Военнослужащие должны иметь больше социальных гарантий.", detail:"Расширение льгот, жилищных программ и пенсий для ветеранов и контрактников." },
  { n:39, sec:"IV", text:"Россия должна поддерживать союзников военными средствами.", detail:"Проекция геополитической силы за пределами страны." },
  { n:40, sec:"IV", text:"Гражданский контроль над армией важен для демократии.", detail:"Подотчетность оборонных ведомств парламенту и общественным институтам." },
  { n:41, sec:"V", text:"Государство должно усиливать контроль над интернетом.", detail:"Цензура, блокировки запрещенных ресурсов ради национальной безопасности." },
  { n:42, sec:"V", text:"Иностранные соцсети несут угрозу.", detail:"Блокировки западных платформ из-за опасения внешнего манипулирования мнениями." },
  { n:43, sec:"V", text:"Государство должно иметь доступ к переписке граждан.", detail:"Ключи шифрования, сбор метаданных операторами для борьбы с терроризмом." },
  { n:44, sec:"V", text:"Цифровизация госуслуг улучшает жизнь людей.", detail:"Активное развитие цифровой экосистемы государства (Госуслуги, ЕГР)." },
  { n:45, sec:"V", text:"Биометрические данные должны храниться у государства.", detail:"Единые государственные базы биометрии для безопасности и верификации." },
  { n:46, sec:"V", text:"Нужно ограничить распространение «фейков» в интернете.", detail:"Законодательное регулирование недостоверной информации под угрозой уголовной ответственности." },
  { n:47, sec:"V", text:"Свобода интернета важнее соображений безопасности.", detail:"Полный отказ от государственной цензуры, запретов VPN и слежки в сети." },
  { n:48, sec:"V", text:"Граждане должны иметь право на анонимность в сети.", detail:"Анонимная регистрация без обязательной привязки к паспорту или СИМ-картам." },
  { n:49, sec:"V", text:"Россия должна развивать собственные цифровые платформы.", detail:"Отечественные операционные системы, поисковики, процессоры и ИТ-сервисы." },
  { n:50, sec:"V", text:"Искусственный интеллект должен регулироваться государством.", detail:"Лицензирование и контроль за обучением и применением ИИ-систем." },
  { n:51, sec:"VI", text:"Государство должно поддерживать традиционные религии.", detail:"Роль конфессий (православие, ислам) в поддержании духовно-нравственной стабильности." },
  { n:52, sec:"VI", text:"ЛГБТ-пропаганда должна быть запрещена.", detail:"Законодательный запрет на публичную демонстрацию нетрадиционных сексуаческих отношений." },
  { n:53, sec:"VI", text:"Русская культура должна активно поддерживаться.", detail:"Государственные субсидии отечественным фильмам, литературе и театрам с патриотической повесткой." },
  { n:54, sec:"VI", text:"Западные культурные влияния представляют угрозу.", detail:"Противодействие вестернизации и чуждым российскому обществу ценностей." },
  { n:55, sec:"VI", text:"Церковь не должна влиять на политику.", detail:"Принципиально светский характер государства и невмешательство духовенства в госуправление." },
  { n:56, sec:"VI", text:"Символы СССР должны чтиться наравне с имперскими.", detail:"Интеграция советского исторического периода в общую летопись достижений Отечества." },
  { n:57, sec:"VI", text:"Традиционная семья — основа общества.", detail:"Приоритет семейного союза мужчины и женщины, воспитание многодетности." },
  { n:58, sec:"VI", text:"Школьное образование должно воспитывать патриотов.", detail:"Внедрение единых учебников истории, уроков «Разговоры о важном»." },
  { n:59, sec:"VI", text:"Культурное разнообразие России — её сила.", detail:"Признание ценности многонациональной и поликультурной идентичности страны." },
  { n:60, sec:"VI", text:"Нужно ограничить иностранные НКО в России.", detail:"Ужесточение законов об иностранных агентах для защиты от зарубежного вмешательства." },
  { n:61, sec:"VII", text:"Россия должна стремиться к многополярному миру.", detail:"Укрепление БРИКС, ШОС и ослабление гегемонии США во внешней политике." },
  { n:62, sec:"VII", text:"России нужно нормализовать отношения с Западом.", detail:"Разрядка, диалог, снятие санкций и возвращение к открытой торговле." },
  { n:63, sec:"VII", text:"Санкции Запада укрепляют Россию.", detail:"Санкции как стимул для развития национального производства и обретения независимости." },
  { n:64, sec:"VII", text:"Права человека важнее государственных интересов.", detail:"Признание личной свободы гражданина главным приоритетом над государственными задачами." },
  { n:65, sec:"VII", text:"Россия должна поддерживать русскоязычных за рубежом.", detail:"Дипломатическая, юридическая и экономическая поддержка соотечественников." },
  { n:66, sec:"VII", text:"НАТО представляет угрозу безопасности России.", detail:"Расширение альянса к российским границам как экзистенциальная военная угроза." },
  { n:67, sec:"VII", text:"Россия должна быть открыта к сотрудничеству с Европой.", detail:"Европейский путь развития, взаимовыгодные торговые и гуманитарные связи." },
  { n:68, sec:"VII", text:"СНГ — зона особых интересов России.", detail:"Интеграция Евразийского экономического союза (ЕАЭС) и ОДКБ." },
  { n:69, sec:"VII", text:"Россия должна наладить отношения с Украиной.", detail:"Поиск дипломатических компромиссов на равноправных основах после завершения конфликта." },
  { n:70, sec:"VII", text:"Китай — стратегический партнёр России.", detail:"Глубокая восточная интеграция, поставка сырья и закупка технологий у КНР." },
  { n:71, sec:"VIII", text:"Экология важнее быстрого экономического роста.", detail:"Ограничение вредных производств, введение эко-налогов ради будущих поколений." },
  { n:72, sec:"VIII", text:"Нужно активнее развивать возобновляемую энергетику.", detail:"Переход на солнечную и ветровую генерацию, поддержка электромобилей." },
  { n:73, sec:"VIII", text:"Атомная энергетика — будущее России.", detail:"Дальнейшие инвестиции в мирный атом (Росатом) как чистый источник энергии." },
  { n:74, sec:"VIII", text:"Граждане должны иметь право на чистую среду.", detail:"Борьба с незаконными свалками, мусоросжигательными заводами и вредными выбросами." },
  { n:75, sec:"VIII", text:"Климатическая повестка — инструмент давления.", detail:"Отношение к зеленому переходу как к попытке Запада ограничить промышленный суверенитет РФ." },
  { n:76, sec:"VIII", text:"Государство должно инвестировать в освоение Арктики.", detail:"Развитие Северного морского пути и арктического шельфа." },
  { n:77, sec:"VIII", text:"Технологический суверенитет важнее открытого рынка технологий.", detail:"Приоритет разработки собственных чипов и программного обеспечения любой ценой." },
  { n:78, sec:"VIII", text:"Нужно поддерживать экологически ответственный бизнес.", detail:"Предоставление налоговых льгот и стимулов для предприятий, внедряющих очистные системы." },
  { n:79, sec:"VIII", text:"Россия должна развивать свою космическую программу.", detail:"Финансирование запусков к Луне, строительство отечественной орбитальной станции." },
  { n:80, sec:"VIII", text:"Цифровая экономика — приоритет развития.", detail:"Поддержка ИТ-сектора, венчурных фондов и стартапов на государственном уровне." },
  { n:81, sec:"IX", text:"России нужна более жёсткая миграционная политика.", detail:"Ограничение въезда, визовый режим со странами Центральной Азии." },
  { n:82, sec:"IX", text:"Многонациональность России — её богатство.", detail:"Равноправие всех коренных этносов страны, поддержка культурного разнообразия." },
  { n:83, sec:"IX", text:"Мигранты должны интегрироваться в русскую культуру.", detail:"Обязательные строгие экзамены по языку, культуре, истории России для работы." },
  { n:84, sec:"IX", text:"Граждане РФ должны иметь приоритет при трудоустройстве.", detail:"Введение строгих квот на привлечение иностранных рабочих в ритейле, строительстве и такси." },
  { n:85, sec:"IX", text:"Нелегальных мигрантов нужно немедленно депортировать.", detail:"Проведение регулярных рейдов и жесткое выдворение нарушителей законодательства." },
  { n:86, sec:"IX", text:"Русский язык должен быть единственным официальным.", detail:"Статус русского языка как главного государствообразующего, ограничение региональных языков." },
  { n:87, sec:"IX", text:"Нац. меньшинства должны иметь культурную автономию.", detail:"Право на преподавание местных языков и культурную самоидентификацию в регионах." },
  { n:88, sec:"IX", text:"Диаспоры несут ответственность за соотечественников.", detail:"Коллективная общественная ответственность национальных объединений за проступки земляков." },
  { n:89, sec:"IX", text:"Нужно ограничить приток из культурно далёких стран.", detail:"Избирательный подход к миграции на основе культурной и религиозной совместимости." },
  { n:90, sec:"IX", text:"Россия должна принимать русскоязычных переселенцев.", detail:"Приоритетное предоставление гражданства соотечественникам и этническим русским." },
  { n:91, sec:"X", text:"Сильный лидер важнее полной конкуренции.", detail:"Эффективность централизованного лидерства против долгой демократической процедуры согласований." },
  { n:92, sec:"X", text:"Молодёжи нужно дать больше политической свободы.", detail:"Участие молодых людей в политической деятельности и управлении без цензурных рамок." },
  { n:93, sec:"X", text:"Нужно сокращать влияние олигархов.", detail:"Ограничение лоббистских возможностей крупного капитала и сверхбогатых граждан." },
  { n:94, sec:"X", text:"Будущее — в сильном государстве с соц. справедливостью.", detail:"Синтез патерналистской государственной опеки и высокого уровня личной защищенности." },
  { n:95, sec:"X", text:"Неравенство доходов в России слишком велико.", detail:"Гигантская пропасть между сверхбогатыми мегаполисами и депрессивной провинцией." },
  { n:96, sec:"X", text:"Частный бизнес обычно эффективнее государства.", detail:"Приоритет частной инициативы перед громоздкими государственными учреждениями." },
  { n:97, sec:"X", text:"Цензура в условиях кризиса может быть оправдана.", detail:"Временное ограничение информационных свобод во имя общенациональной безопасности." },
  { n:98, sec:"X", text:"Россия должна стремиться к тех. самодостаточности.", detail:"Создание полной технологической цепочки производства внутри страны." },
  { n:99, sec:"X", text:"Нужно вводить прогрессивный налог для богатых.", detail:"Повышение ставки НДФЛ для миллионеров с целью перераспределения благ." },
  { n:100,sec:"X", text:"Военные расходы сейчас слишком высоки.", detail:"Мнение о том, что оборонный бюджет следует урезать в пользу социальных обязательств." },
];

const SHORT_INDICES = [1, 2, 11, 15, 17, 21, 24, 31, 35, 41, 47, 51, 55, 61, 62, 71, 81, 91, 93, 95];

const SCALE_LABELS: Record<number, string> = { 
  1: "Против", 
  2: "Скорее нет", 
  3: "Нейтрально", 
  4: "Скорее да", 
  5: "Согласен" 
};

const ARCHETYPES: Archetype[] = [
  { name: "Государственник-традиционалист", desc: "Приоритет — сильное государство, традиционные ценности, порядок и социальная поддержка в рамках государственного суверенитета.", party: "ER" },
  { name: "Советский социалист", desc: "Выступает за сильное социальное государство, национализацию стратегических отраслей и возвращение советских стандартов справедливости.", party: "KPRF" },
  { name: "Национал-популист", desc: "Жёсткая внешняя политика, акцент на национальной идентичности, ограничении миграции и сильной армии.", party: "LDPR" },
  { name: "Умеренный прогрессист", desc: "Рыночные реформы, поддержка бизнеса, цифровые инновации и умеренный прагматичный подход к политическим свободам.", party: "NL" },
  { name: "Социал-демократ", desc: "Умеренные левые взгляды. Сочетание сильной социальной политики, защиты трудящихся и патриотических ориентиров.", party: "SR" },
  { name: "Либерал-европеист", desc: "Права человека, свобода слова, правовое государство, рыночная экономика и открытость к сотрудничеству с внешним миром.", party: "YAB" },
  { name: "Социал-патерналист", desc: "Особый акцент на поддержке старшего поколения, качественной медицине, защите пенсионеров и социальной справедливости со стороны государства.", party: "RPPS" },
  { name: "Радикальный коммунист", desc: "Бескомпромиссные левые идеи: полный возврат к плановой экономике, ликвидация крупной частной собственности и возвращение к ленинским принципам.", party: "KR" },
  { name: "Эко-модернист", desc: "Приоритет экологической безопасности, бережного природопользования, внедрения зеленых технологий при сохранении стабильного развития страны.", party: "ZEL" },
  { name: "Имперский консерватор", desc: "Правый консерватизм. Максимальный фокус на оборонном суверенитете, военно-промышленной мощи и жестком противодействии внешнему давлению.", party: "ROD" },
  { name: "Цифровой технократ", desc: "Прямая электронная демократия, блокчейн-голосование, технологическая независимость и минимизация бюрократического аппарата с помощью алгоритмов.", party: "PPD" },
  { name: "Консервативный либерал", desc: "Правоцентристская позиция: экономические свободы для бизнеса при сохранении лояльности национальным интересам государства.", party: "GP" }
];

const AXES: Axis[] = [
  { label: "Государственник", opposite: "Либерал",         qs: [1,4,6,7,33,36,37,41,42,43,46,54,60,91,97] },
  { label: "Социалист",       opposite: "Рыночник",        qs: [11,12,15,16,18,21,22,23,27,28,29,30,93,95,99] },
  { label: "Традиционалист",  opposite: "Прогрессист",     qs: [25,51,52,53,57,58,83,85,86,88,89] },
  { label: "Изоляционист",    opposite: "Глобалист",       qs: [5,20,61,62,63,64,66,67,69,70,75,77] },
];

function calcScores(answers: Record<number, number>, weights: Record<string, number>): Record<string, number> {
  const totals: Record<string, number> = {}; 
  const counts: Record<string, number> = {};
  const pKeys = ["ER","KPRF","LDPR","NL","SR","YAB","RPPS","KR","ZEL","ROD","PPD","GP"];
  
  pKeys.forEach(k => { 
    totals[k] = 0; 
    counts[k] = 0; 
  });
  
  Object.entries(answers).forEach(([qn, val]) => {
    const q = parseInt(qn);
    const questionData = ALL_QUESTIONS.find(x => x.n === q);
    const sec = questionData ? questionData.sec : "I";
    const w = weights[sec] !== undefined ? weights[sec] : 1;
    const row = MATRIX[q];
    if (!row) return;
    pKeys.forEach((p, i) => {
      const diff = 4 - Math.abs(val - row[i]);
      totals[p] += diff * w;
      counts[p] += 4 * w;
    });
  });
  
  const res: Record<string, number> = {}; 
  pKeys.forEach(p => { 
    res[p] = counts[p] > 0 ? Math.round((totals[p] / counts[p]) * 100) : 0; 
  });
  return res;
}

function calcAxes(answers: Record<number, number>): Axis[] {
  return AXES.map(ax => {
    const vals = ax.qs.map(q => answers[q]).filter(v => v !== undefined);
    if (!vals.length) return { ...ax, score: 50 };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { ...ax, score: Math.round(((avg - 1) / 4) * 100) };
  });
}

function getArchetype(scores: Record<string, number>): Archetype {
  if (!scores || Object.keys(scores).length === 0) return ARCHETYPES[0];
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topParty = sorted[0][0];
  return ARCHETYPES.find(a => a.party === topParty) || ARCHETYPES[0];
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
  
  :root {
    --bg: #090d16;
    --card: rgba(17, 24, 39, 0.75);
    --border: rgba(255, 255, 255, 0.08);
    --accent: #6366f1;
    --accent-glow: rgba(99, 102, 241, 0.25);
    --text: #f3f4f6;
    --muted: #9ca3af;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
  
  .app { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  
  /* Typography */
  h1 { font-family: 'Playfair Display', serif; font-size: clamp(30px, 7vw, 50px); font-weight: 900; line-height: 1.1; text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, #ffffff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { text-align: center; color: var(--muted); font-size: 16px; margin-bottom: 40px; line-height: 1.5; }

  /* Cards */
  .glass-card { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 32px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); margin-bottom: 24px; transition: transform 0.2s, border-color 0.2s; }

  /* Main Menu Options */
  .menu-option { cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.06); }
  .menu-option:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 10px 30px var(--accent-glow); }

  /* Quiz Styles */
  .q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 700; color: #818cf8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; }
  .q-text { font-family: 'Playfair Display', serif; font-size: clamp(20px, 4.5vw, 26px); margin-bottom: 16px; line-height: 1.35; color: #f9fafb; }
  
  .detail-toggle { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: #a5b4fc; font-size: 13px; font-weight: 500; cursor: pointer; margin-bottom: 20px; transition: color 0.15s; }
  .detail-toggle:hover { color: #c7d2fe; }
  .detail-pane { background: rgba(99, 102, 241, 0.08); border-left: 3px solid #6366f1; border-radius: 4px; padding: 14px 18px; font-size: 14px; line-height: 1.5; color: #cbd5e1; margin-bottom: 24px; }

  .scale { display: flex; flex-direction: column; gap: 10px; }
  .scale-btn { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); padding: 14px 20px; border-radius: 12px; color: var(--text); cursor: pointer; transition: all 0.2s; text-align: left; font-size: 15px; display: flex; align-items: center; gap: 14px; }
  .scale-btn:hover { background: rgba(255, 255, 255, 0.06); border-color: var(--muted); }
  .scale-btn.active { background: #4f46e5; border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); font-weight: 700; }
  
  .point-indicator { width: 10px; height: 10px; border-radius: 50%; border: 2px solid currentColor; flex-shrink: 0; }

  .nav { display: flex; justify-content: space-between; margin-top: 32px; gap: 16px; }
  .btn { flex: 1; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1.5px; transition: all 0.2s; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-next { background: #4f46e5; color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
  .btn-next:hover:not(:disabled) { background: #6366f1; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
  .btn-next:disabled { opacity: 0.25; cursor: not-allowed; box-shadow: none; }
  .btn-back { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-back:hover { border-color: var(--muted); color: var(--text); }

  /* Results Styles */
  .arch-label { text-align: center; font-size: 11px; color: #818cf8; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px; font-weight: 700; }
  .arch-name { text-align: center; font-family: 'Playfair Display', serif; font-size: clamp(28px, 5.5vw, 38px); margin-bottom: 12px; color: #ffffff; font-weight: 900; }
  .arch-desc { text-align: center; font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 600px; margin: 0 auto 32px; }

  .tabs { display: flex; gap: 6px; margin-bottom: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); padding: 4px; border-radius: 12px; }
  .tab-btn { flex: 1; padding: 12px; background: none; border: none; border-radius: 8px; color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.15s; }
  .tab-btn.active { background: #312e81; color: #c7d2fe; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05); }

  .party-list { display: flex; flex-direction: column; gap: 14px; }
  .party-item { background: rgba(255, 255, 255, 0.02); padding: 16px; border-radius: 16px; border: 1px solid var(--border); }
  .party-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; font-weight: 600; }
  
  /* Контейнер для отображения логотипов */
  .party-logo-container {
    width: 44px;
    height: 44px;
    background: #e2e8f0; /* Светло-серая подложка для максимального контраста прозрачных логотипов */
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 3px;
    overflow: hidden;
  }
  .party-logo-container.large {
    width: 68px;
    height: 68px;
    border-radius: 16px;
    padding: 5px;
  }
  .party-logo-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
  
  /* Текст на тёмном фоне */
  .dark-contrast-text {
    color: #ffffff !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .p-bar-bg { height: 10px; background: rgba(0, 0, 0, 0.4); border-radius: 5px; overflow: hidden; }
  .p-bar-fill { height: 100%; border-radius: 5px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

  /* Custom Axes representation */
  .axis-item { margin-bottom: 24px; }
  .axis-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 8px; }
  .axis-track { height: 8px; background: rgba(0, 0, 0, 0.4); border-radius: 4px; border: 1px solid var(--border); position: relative; }
  .axis-marker { position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 50%; background: #a5b4fc; box-shadow: 0 0 10px #6366f1; border: 2px solid var(--bg); transform: translate(-50%, -50%); transition: left 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

  /* Interactive Calibration Weights */
  .calibration-section { margin-top: 40px; border-top: 1px dashed var(--border); padding-top: 32px; }
  .calibration-title { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 8px; }
  .calibration-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
  .weight-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
  .w-label { font-size: 14px; font-weight: 500; color: #cbd5e1; }
  .w-controls { display: flex; align-items: center; gap: 12px; }
  .w-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .w-btn:hover { background: rgba(255,255,255,0.08); border-color: var(--muted); }
  .w-val { font-family: 'Inter', monospace; font-weight: 700; color: #818cf8; min-width: 40px; text-align: center; }

  /* Custom internal modal block for confirmation */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .modal-box { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; max-width: 450px; width: 100%; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 12px; color: #ffffff; }
  .modal-text { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; }

  /* Progress Indicators */
  .indicator-track { height: 4px; background: rgba(255, 255, 255, 0.05); border-radius: 2px; overflow: hidden; margin-bottom: 24px; }
  .indicator-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #818cf8); transition: width 0.3s ease; }

  /* Feedback / Toasts */
  .toast { position: fixed; bottom: 24px; right: 24px; background: #1e1b4b; border: 1px solid #4f46e5; color: #c7d2fe; padding: 12px 24px; border-radius: 12px; z-index: 1000; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); animation: slideIn 0.2s ease; }

  @keyframes slideIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

interface PartyLogoProps {
  party: Party;
  size?: "small" | "large";
}

function PartyLogo({ party, size = "small" }: PartyLogoProps) {
  const [error, setError] = useState(false);
  const containerClass = size === "large" ? "party-logo-container large" : "party-logo-container";

  if (error || !party.logo) {
    return (
      <div className={containerClass} style={{ background: "#1e293b", fontSize: size === "large" ? "32px" : "20px" }}>
        {party.emoji}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <img 
        className="party-logo-img" 
        src={party.logo} 
        alt={party.name} 
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<string>("home"); 
  const [mode, setMode] = useState<"short" | "full">("short"); 
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState<number>(0);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [tab, setTab] = useState<string>("parties"); 
  const [toast, setToast] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; nextScreen: string }>({ show: false, nextScreen: "" });

  const qs = useMemo(() => {
    return mode === "short" 
      ? ALL_QUESTIONS.filter(q => SHORT_INDICES.includes(q.n)) 
      : ALL_QUESTIONS;
  }, [mode]);

  const current = qs[idx] || qs[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, idx]);

  const scores = useMemo(() => calcScores(answers, weights), [answers, weights]);
  const arch = useMemo(() => getArchetype(scores), [scores]);
  const axesScores = useMemo(() => calcAxes(answers), [answers]);

  const handleNext = () => {
    if (idx < qs.length - 1) {
      setIdx(idx + 1);
      setShowDetail(false);
    } else {
      setScreen("results");
    }
  };

  const adjustW = (id: string, delta: number) => {
    setWeights(p => {
      const v = p[id] !== undefined ? p[id] : 1;
      const nextVal = parseFloat((v + delta).toFixed(1));
      if (nextVal < 0.5 || nextVal > 3) return p;
      return { ...p, [id]: nextVal };
    });
  };

  const handleRestart = (force = false) => {
    if (!force && Object.keys(answers).length > 0 && screen === "quiz") {
      setConfirmModal({ show: true, nextScreen: "home" });
    } else {
      setAnswers({});
      setWeights({});
      setIdx(0);
      setShowDetail(false);
      setScreen("home");
      setConfirmModal({ show: false, nextScreen: "" });
    }
  };

  const startQuiz = (quizMode: "short" | "full") => {
    setMode(quizMode);
    setAnswers({});
    setWeights({});
    setIdx(0);
    setShowDetail(false);
    setScreen("quiz");
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleShare = async () => {
    const scoresEntries = Object.entries(scores) as [string, number][];
    const leader = scoresEntries.sort((a, b) => b[1] - a[1])[0];
    const leaderParty = PARTIES.find(p => p.code === leader[0]);
    const leaderPartyEmoji = leaderParty?.emoji ?? "🏛️";
    const leaderPartyName = leaderParty?.name ?? "Партия";
    
    const text = `Мой идеологический тип: ${arch.name}\nМаксимальное совпадение: ${leaderPartyEmoji} ${leaderPartyName} (${leader[1]}%)\nПройти тест политического компаса!`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        triggerToast("Результаты скопированы в буфер обмена!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        triggerToast("Результаты скопированы в буфер обмена!");
      }
    } catch (err) {
      triggerToast("Не удалось скопировать. Попробуйте вручную.");
    }
  };

  if (screen === "home") {
    return (
      <div className="app">
        <style>{css}</style>
        
        <header className="hero">
          <h1>Российский<br />Политический Компас</h1>
          <p className="subtitle">Узнайте свое точное положение в современном политическом ландшафте среди 12 ключевых партий</p>
        </header>

        <div className="glass-card menu-option" onClick={() => startQuiz("short")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "6px", color: "#f3f4f6" }}>Быстрый тест</h2>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>20 ключевых вопросов по ключевым темам для экспресс-оценки</p>
            </div>
            <span style={{ fontSize: "12px", background: "#312e81", color: "#a5b4fc", padding: "6px 12px", borderRadius: "20px", fontWeight: "700" }}>~ 3 мин</span>
          </div>
        </div>

        <div className="glass-card menu-option" onClick={() => startQuiz("full")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "6px", color: "#f3f4f6" }}>Полный анализ</h2>
              <p style={{ color: "var(--muted)", fontSize: "14px" }}>Глубокий тест из 100 вопросов по всем 10 сферам государственной и общественной жизни</p>
            </div>
            <span style={{ fontSize: "12px", background: "#065f46", color: "#34d399", padding: "6px 12px", borderRadius: "20px", fontWeight: "700" }}>~ 15 мин</span>
          </div>
        </div>

        <div className="glass-card menu-option" onClick={() => setScreen("glossary")}>
          <h2 style={{ fontSize: "18px", marginBottom: "6px", color: "#f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>📚 Справочник партий</h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>Ознакомьтесь с актуальным спектром представленных политических сил, их лидерами и программами</p>
        </div>
      </div>
    );
  }

  if (screen === "glossary") {
    return (
      <div className="app">
        <style>{css}</style>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", textAlign: "left" }}>Политическая сцена</h1>
          <p style={{ color: "var(--muted)" }}>Официальные партии, формирующие общественную повестку</p>
        </header>

        <div className="party-list">
          {PARTIES.map(p => (
            <div key={p.code} className="glass-card" style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <PartyLogo party={p} size="large" />
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff", marginBottom: "4px" }}>{p.name}</h3>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>Лидер: {p.leader}</span>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" }}>{p.descr}</p>
            </div>
          ))}
        </div>

        <button className="btn btn-back" style={{ marginTop: "24px" }} onClick={() => setScreen("home")}>Вернуться на главную</button>
      </div>
    );
  }

  if (screen === "quiz") {
    const progressPercent = Math.round(((idx) / qs.length) * 100);

    return (
      <div className="app">
        <style>{css}</style>
        
        <div className="indicator-track">
          <div className="indicator-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="glass-card">
          <div className="q-meta">
            <span>{SECTIONS.find(s => s.id === current.sec)?.label}</span>
            <span>{idx + 1} / {qs.length}</span>
          </div>
          
          <h2 className="q-text">{current.text}</h2>

          <button className="detail-toggle" onClick={() => setShowDetail(!showDetail)}>
            <span>{showDetail ? "▲ Скрыть контекст" : "▼ Раскрыть контекст вопроса"}</span>
          </button>

          {showDetail && (
            <div className="detail-pane">
              {current.detail}
            </div>
          )}

          <div className="scale">
            {[1, 2, 3, 4, 5].map(v => (
              <button 
                key={v} 
                className={`scale-btn ${answers[current.n] === v ? "active" : ""}`} 
                onClick={() => setAnswers({ ...answers, [current.n]: v })}
              >
                <div className="point-indicator" />
                <span>{SCALE_LABELS[v]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="nav">
          <button className="btn btn-back" onClick={() => idx > 0 ? setIdx(idx - 1) : handleRestart(false)}>Назад</button>
          <button className="btn btn-next" disabled={answers[current.n] === undefined} onClick={handleNext}>Дальше →</button>
        </div>

        {confirmModal.show && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 className="modal-title">Сбросить прогресс?</h3>
              <p className="modal-text">Вы уже начали тест. Если вы вернетесь на главную страницу, все ваши текущие ответы будут безвозвратно утеряны. Продолжить?</p>
              <div className="modal-actions">
                <button className="btn btn-back" style={{ flex: 1 }} onClick={() => setConfirmModal({ show: false, nextScreen: "" })}>Отмена</button>
                <button className="btn" style={{ flex: 1, background: "#ef4444", color: "#ffffff" }} onClick={() => handleRestart(true)}>Да, выйти</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <style>{css}</style>
      
      <div className="glass-card" style={{ borderBottom: "4px solid #6366f1" }}>
        <div className="arch-label">Ваш политический архетип</div>
        <h1 className="arch-name dark-contrast-text">{arch.name}</h1>
        <p className="arch-desc">{arch.desc}</p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === "parties" ? "active" : ""}`} onClick={() => setTab("parties")}>Совпадение с партиями</button>
        <button className={`tab-btn ${tab === "axes" ? "active" : ""}`} onClick={() => setTab("axes")}>Политические шкалы</button>
      </div>

      {tab === "parties" && (
        <div className="party-list">
          {(Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([code, val]) => {
            const p = PARTIES.find(x => x.code === code);
            if (!p) return null;
            return (
              <div key={code} className="party-item" style={{ borderLeft: `4px solid ${p.color}` }}>
                <div className="party-head">
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <PartyLogo party={p} size="small" />
                    <span className="dark-contrast-text" style={{ fontWeight: "600" }}>{p.name}</span>
                  </span>
                  <span style={{ color: p.color, fontWeight: "700" }}>{val}%</span>
                </div>
                <div className="p-bar-bg">
                  <div className="p-bar-fill" style={{ width: `${val}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "axes" && (
        <div className="glass-card">
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px", lineHeight: "1.5" }}>
            Шкалы определяют ваше местоположение по классическим политическим дихотомиям на основе ваших ответов.
          </p>
          {axesScores.map((ax, i) => (
            <div key={i} className="axis-item">
              <div className="axis-header">
                <span>{ax.label}</span>
                <span>{ax.opposite}</span>
              </div>
              <div className="axis-track">
                <div className="axis-marker" style={{ left: `${ax.score !== undefined ? ax.score : 50}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                <span>{100 - (ax.score !== undefined ? ax.score : 50)}%</span>
                <span>{ax.score !== undefined ? ax.score : 50}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="glass-card calibration-section">
        <h2 className="calibration-title">🎯 Уточнить результат (веса факторов)</h2>
        <p className="calibration-desc">
          Измените вес (значимость) каждой категории. Увеличение веса критической для вас темы в несколько раз увеличит её влияние на итоговое распределение совпадения с партиями.
        </p>

        <div>
          {SECTIONS.map(s => {
            const v = weights[s.id] !== undefined ? weights[s.id] : 1;
            return (
              <div key={s.id} className="weight-row">
                <span className="w-label">{s.label}</span>
                <div className="w-controls">
                  <button className="w-btn" onClick={() => adjustW(s.id, -0.5)}>—</button>
                  <span className="w-val">{v.toFixed(1)}</span>
                  <button className="w-btn" onClick={() => adjustW(s.id, 0.5)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="nav">
        <button className="btn btn-back" onClick={() => handleRestart(false)}>В начало</button>
        <button className="btn btn-next" onClick={handleShare}>Поделиться ↗</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
