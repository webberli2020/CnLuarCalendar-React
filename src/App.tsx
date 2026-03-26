import React, { useState } from 'react';
import { 
    lunarInfo, solarTerm, sTermInfo, nStr1, nStr2, nStr3, 
    Gan, Zhi, Animals, animalEmoji 
} from './lunarData';

// --- Lunar Class Implementation ---
class Lunar {
    year: number = 0;
    month: number = 0;
    day: number = 0;
    isLeap: boolean = false;
    invalid: boolean = false;

    constructor(objDate: Date) {
        let i, leap = 0, temp = 0;
        const baseDate = Date.UTC(1900, 0, 31);
        const targetDate = Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate());
        let offset = (targetDate - baseDate) / 86400000;

        if (offset < 0 || objDate.getFullYear() < 1901) {
            this.invalid = true;
            return;
        }

        for (i = 1900; i < 2100 && offset > 0; i++) {
            temp = this.lYearDays(i);
            offset -= temp;
        }

        if (offset < 0) {
            offset += temp;
            i--;
        }

        this.year = i;
        leap = this.leapMonth(i);
        this.isLeap = false;

        for (i = 1; i < 13 && offset > 0; i++) {
            if (leap > 0 && i === (leap + 1) && this.isLeap === false) {
                --i;
                this.isLeap = true;
                temp = this.leapDays(this.year);
            } else {
                temp = this.monthDays(this.year, i);
            }

            if (this.isLeap === true && i === (leap + 1)) this.isLeap = false;
            offset -= temp;
        }

        if (offset === 0 && leap > 0 && i === leap + 1) {
            if (this.isLeap) {
                this.isLeap = false;
            } else {
                this.isLeap = true;
                --i;
            }
        }

        if (offset < 0) {
            offset += temp;
            --i;
        }

        this.month = i;
        this.day = offset + 1;
    }

    lYearDays(y: number) {
        let i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
        return (sum + this.leapDays(y));
    }

    leapDays(y: number) {
        if (this.leapMonth(y)) return ((lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
        return (0);
    }

    leapMonth(y: number) {
        return (lunarInfo[y - 1900] & 0xf);
    }

    monthDays(y: number, m: number) {
        return ((lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
    }
}

// --- Utility Functions ---
function getTerm(y: number, n: number) {
    return new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5)).getUTCDate();
}

function getGZDay(date: Date) {
    const baseDate = Date.UTC(1900, 0, 31);
    const targetDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = Math.round((targetDate - baseDate) / 86400000);
    const gzD = (offset + 40) % 60;
    const finalGzD = gzD < 0 ? gzD + 60 : gzD;
    return {
        name: Gan[finalGzD % 10] + Zhi[finalGzD % 12]
    };
}

function getGZData(date: Date, mode: string) {
    const y = date.getFullYear();
    let gzYear = y;
    const lD = new Lunar(date);
    if (lD.invalid) return { gz: "---", an: "---", em: "" };
    if (mode === "CHUNJIE") {
        gzYear = lD.year;
    } else {
        const lcDay = getTerm(y, 2);
        if (date.getMonth() < 1 || (date.getMonth() === 1 && date.getDate() < lcDay)) gzYear = y - 1;
    }
    let g = (gzYear - 3) % 10;
    let z = (gzYear - 3) % 12;
    if (g <= 0) g += 10;
    if (z <= 0) z += 12;
    const an = Animals[z - 1];
    return { gz: Gan[g - 1] + Zhi[z - 1], an: an, em: animalEmoji[an] || "" };
}

function getMainName(name: string) {
    if (!name) return "";
    return name.split('(')[0].split('（')[0].trim();
}

function formatDate(d: Date) {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return (month < 10 ? '0' + month : month) + "-" + (day < 10 ? '0' + day : day);
}

function getNthDay(year: number, month: number, nth: number, weekday: number) {
    const first = new Date(year, month, 1).getDay();
    const d = (weekday >= first ? (weekday - first + 1) : (7 - first + weekday + 1)) + (nth - 1) * 7;
    return (month + 1 < 10 ? '0' : '') + (month + 1) + '-' + (d < 10 ? '0' : '') + d;
}

function getLastWeekday(year: number, month: number, weekday: number) {
    const last = new Date(year, month + 1, 0);
    const diff = (last.getDay() >= weekday) ? (last.getDay() - weekday) : (last.getDay() + 7 - weekday);
    last.setDate(last.getDate() - diff);
    return formatDate(last);
}

function getEaster(y: number) {
    const a = y % 19;
    const b = Math.floor(y / 100);
    const c = y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
}

// --- Holiday Database ---
const holidayDB: any = {
    "中国": { 
        css: "tag-china", prefix: "中", 
        fixed: { 
            "01-01":"元旦",
						"1947-01-05":"YXR公历🎂",
						"1973-02-18":"LWB公历🎂",
						"03-08":"妇女节",
						"05-01":"劳动节",
						"1919-05-04":"青年节",
						"06-01":"儿童节",
						"1973-06-08":"ZXJ🎂",
						"1921-07-01":"建党节",
						"2023-07-10":"ZGZ公历忌日🕯",
						"1927-08-01":"建军节",
						"08-08":"台湾父亲节",
						"1945-09-03":"抗战胜利日(抗日战争胜利纪念日)",
						"1976-09-09":"毛泽东忌日",
						"09-10":"教师节",
						"09-30":"烈士纪念日",
						"1949-10-01":"国庆节",
						"2001-10-04":"QQ🎂",
						"2006-10-08":"ZZ🎂",
						"1945-10-29":"WJY公历🎂",
						"2025-11-01":"XSJ忌日🕯",
						"1998-11-6":"结婚纪念日🎂",
						"2020-11-14":"LK公历忌日🕯",
						"1978-12-12":"ZMM🎂",
						"12-13":"国家公祭日🕯(南京大屠杀死难者国家公祭日)",
						"1893-12-26":"毛泽东🎂"
        },
        fixed2: {
            "1-1":"春节/鸡日(这一天不能杀鸡，也不能打骂孩子，以求吉利。古人会在门上贴鸡画，用其象征吉祥和驱邪。)",
					"1-2":"犬日(祭祀狗神，感谢狗的看家护院之恩。在民俗中，这也是出嫁女儿“回门”、夫婿同行“迎婿日”的日子。)",
					"1-3":"猪日(传说中这是女娲造猪的日子。民间有“初一早，初二早，初三睡到饱”的说法，因为这一天通常被认为是容易发生口角争执，所以老一辈讲究不外出拜年，宜在家补觉休息。)",
					"1-4":"羊日/接神日(传说女娲造羊的日子。这一天也是民间迎接灶神回人间、清点全家人口的日子，所以也叫“接神日”)",
					"1-5":"牛日/破五(之前的禁忌如不能倒垃圾、不能动针线在这一天破除。同时，这是迎财神、送穷神的日子，商店通常在这一天开市。)",
					"1-6":"马日(寓意“马到成功”。在这一天，人们开始正式下田春耕或外出务工，商家也会清理门市，准备正式营业。)",
					"1-7":"人日(女娲创造万物时，前六天分别造出了鸡、狗、猪、羊、牛、马，第七天才造出了人，所以这一天是全人类共同的生日。在这一天，古人有尊敬每一个人、不惩罚犯人的传统。)",
					"1-8":"谷日(传说中这天是谷子的生日。)",
					"1-9":"天日(俗称“天公生”，是玉皇大帝的诞辰。)",
					"1-10":"地日(这一天是石头的生日，也叫“地日”。凡是石制的工具在这一天都禁止使用和搬动。)",
					"1-15":"元宵节(又名上元节——天官赐福。天官大帝在这一天降临人间，校定人之罪福，所以人们张灯结彩，既是庆贺团圆，也是迎接福气。正月是农历的元月，古人称夜为“宵”，所以称正月十五为“元宵节”。)",
					"1973-1-16":"LWB农历🎂",
					"2-2":"龙抬头",
					"3-3":"上巳节(农历三月初三，是中国古人的情人节和春游日。也是壮族最盛大的节日——歌圩节)",
					"5-5":"端午节",
					"5-8":"ZXJ农历🎂",
					"7-7":"七夕节",
					"7-15":"中元节(又名鬼节——地官赦罪。民间相信，这一天地府会放出全部鬼魂，已故的祖先可以回家团圆，因此家家户户祭祖、上坟、点河灯，为亡魂照路，普度孤魂野鬼。)",
					"8-15":"中秋节",
					"2001-8-18":"QQ农历🎂",
					"9-9":"重阳节",
					"1945-09-24":"WJY农历🎂",
					"2020-09-29":"LK农历忌日🕯",
					"10-1":"寒衣节",
					"10-15":"下元节(又名水官节——水官解厄。这天是水官大帝的诞辰，也是他下凡为人们解除灾难的日子)",
					"12-8":"腊八节",
					"1946-12-14":"YXR农历🎂",
					"12-23":"北方小年(送灶神、大扫除、备年货，开始正式进入过年的节奏)",
					"12-24":"南方小年(送灶神、大扫除、备年货，开始正式进入过年的节奏)"
        },
        variable: {
            "2025": { "03-04":"政协开幕(全国政协十四届三次会议)", "03-05":"人大开幕(十四届全国人大三次会议)", "03-10":"政协闭幕", "03-11":"人大闭幕" },
            "2026": { "03-04":"政协开幕(全国政协十四届四次会议)", "03-05":"人大开幕(十四届全国人大四次会议)", "03-11":"政协闭幕", "03-12":"人大闭幕" }
        }
    },
    "巴西": { 
        css: "tag-brazil", prefix: "巴", 
        fixed: { 
            "01-01":"元旦/世界和平日(Confraternização Universal/Ano Novo)",
		        "03-08":"国际妇女节(Dia Internacional da Mulher)",
						"04-21":"蒂拉登特斯(Tiradentes,又称拔牙者纪念日)",
						"05-01":"劳动节(Dia do Trabalho)",
						"1822-09-07":"独立日(Independência do Brasil,巴西于1822年脱离葡萄牙独立)",
						"10-12":"阿帕雷西达圣母日(Nossa Senhora Aparecida,英语Our Lady of Aparecida)",
						"10-31":"萨西节(Dia do Saci,萨西是巴西民间传说中一个戴着红帽子、独腿、抽着烟斗、爱搞恶作剧的黑人男孩。巴西旨在通过庆祝巴西本土的民间传说人物，来构成对美国文化入侵的和平抵抗。)",
						"11-02":"万灵节(Dia de Finados,英语All Souls' Day,去墓地祭奠、缅怀逝去的亲人。)",
						"1889-11-15":"共和国宣言日(Proclamação da República,巴西于1889年废除帝制,建立共和)",
						"12-25":"圣诞节(Natal)"
        },
        variable: {}
    },
    "美国": { 
        css: "tag-us", prefix: "美", 
        fixed: { 
            "01-01":"新年(New Year's Day)",
						"02-14":"情人节(Valentine's Day)",
						"04-01":"愚人节(April Fools' Day)",
						"06-19":"六月节(Juneteenth，它的名字是June和nineteenth的合成词，在每年6月19日庆祝，纪念美国奴隶制的最终结束)",
						"1776-07-04":"独立日(Independence Day,1776年7月4日大陆会议正式通过《独立宣言》,宣告北美13个殖民地脱离英国统治,成为独立的国家)",
						"10-31":"万圣节(Halloween,年轻人的派对,小孩子“不给糖就捣蛋”)",
						"11-11":"退伍军人节 (Veterans Day,向所有在美国武装部队服过役的健在的退伍军人表达敬意的日子。)",
						"12-24":"平安夜(Christmas Eve)",
						"12-25":"圣诞节(Christmas Day,庆祝耶稣基督诞生的基督教节日，如今已发展成涵盖宗教仪式、家庭团聚、礼物赠送和文化传统的盛大节日。)",
						"03-31":"查韦斯日(Cesar Chavez Day,加州节日,纪念的墨西哥裔美国劳工领袖、民权活动家塞萨尔·查韦斯的诞辰和遗产)",
						"04-24":"种族灭绝纪念(Genocide Remembrance Day,加州节日，该纪念日在覆盖多个群体的同时，与亚美尼亚种族灭绝纪念日共享同一个日期，并且亚美尼亚社区的遭遇是其核心纪念内容之一。)",
						"1850-09-09":"加州入美纪念日(Admission Day,加州节日，1850年9月9日加利福尼亚正式加入联邦，成为美国的第31个州)"
        },
        variable: {}
    }
};

// --- Coincidence Calculation ---
function getCoincidingYears(birthYear: number, birthMonth: number, birthDay: number, isLunar: boolean) {
    const results: number[] = [];
    let targetLunarMonth: number | null = null;
    let targetLunarDay: number | null = null;
    let targetGregorianMonth: number | null = null;
    let targetGregorianDay: number | null = null;

    if (!isLunar) {
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        const l = new Lunar(birthDate);
        if (l.invalid) return [];
        targetLunarMonth = l.month;
        targetLunarDay = l.day;
        targetGregorianMonth = birthMonth;
        targetGregorianDay = birthDay;
    } else {
        for (let m = 0; m < 12; m++) {
            for (let d = 1; d <= 31; d++) {
                const testDate = new Date(birthYear, m, d);
                if (testDate.getFullYear() !== birthYear || testDate.getMonth() !== m) continue;
                const l = new Lunar(testDate);
                if (l.month === birthMonth && l.day === birthDay && !l.isLeap) {
                    targetGregorianMonth = m + 1;
                    targetGregorianDay = d;
                    targetLunarMonth = birthMonth;
                    targetLunarDay = birthDay;
                    break;
                }
            }
            if (targetGregorianMonth) break;
        }
    }

    if (!targetGregorianMonth || !targetLunarMonth || !targetLunarDay) return [];

    for (let y = birthYear + 1; y <= 2100; y++) {
        const testDate = new Date(y, targetGregorianMonth - 1, targetGregorianDay);
        if (testDate.getMonth() + 1 !== targetGregorianMonth) continue;
        const l = new Lunar(testDate);
        if (l.month === targetLunarMonth && l.day === targetLunarDay && !l.isLeap) {
            results.push(y);
        }
    }
    return results;
}

// --- Special Customs Calculation (Sanjiu & Sanfu) ---
function getSpecialCustoms(year: number) {
    const customs: { [key: string]: string } = {};

    // --- Sanjiu (数九) ---
    // Starts from Winter Solstice (冬至) of the PREVIOUS year for Jan/Feb
    // and from Winter Solstice of CURRENT year for Dec
    const getJiu = (y: number) => {
        const dzDay = getTerm(y, 23); // Winter Solstice
        const dzDate = new Date(y, 11, dzDay);
        for (let i = 0; i < 9; i++) {
            const startDate = new Date(dzDate.getTime() + i * 9 * 86400000);
            const name = i === 0 ? "一九" : i === 1 ? "二九" : i === 2 ? "三九" : 
                         i === 3 ? "四九" : i === 4 ? "五九" : i === 5 ? "六九" : 
                         i === 6 ? "七九" : i === 7 ? "八九" : "九九";
            customs[formatDate(startDate)] = name + (i === 2 ? "(三九严寒)" : "");
        }
    };
    getJiu(year - 1);
    getJiu(year);

    // --- Sanfu (三伏) ---
    // Toufu: 3rd Geng day after Summer Solstice
    // Zhongfu: 4th Geng day after Summer Solstice
    // Mofu: 1st Geng day after Autumn Begins
    const isGengDay = (d: Date) => {
        const baseDate = Date.UTC(1900, 0, 31);
        const targetDate = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        const offset = Math.round((targetDate - baseDate) / 86400000);
        return (offset + 40) % 10 === 6; // Geng is index 6
    };

    const xzDay = getTerm(year, 11); // Summer Solstice (June)
    let xzDate = new Date(year, 5, xzDay);
    let gengCount = 0;
    let toufuDate: Date | null = null;
    let zhongfuDate: Date | null = null;

    let tempDate = new Date(xzDate);
    while (gengCount < 4) {
        tempDate.setDate(tempDate.getDate() + 1);
        if (isGengDay(tempDate)) {
            gengCount++;
            if (gengCount === 3) toufuDate = new Date(tempDate);
            if (gengCount === 4) zhongfuDate = new Date(tempDate);
        }
    }

    const lqDay = getTerm(year, 14); // Autumn Begins (August)
    let lqDate = new Date(year, 7, lqDay);
    let mofuDate: Date | null = null;
    tempDate = new Date(lqDate);
    // Mofu is the 1st Geng day AFTER Autumn Begins (including the day itself if it is Geng)
    if (isGengDay(tempDate)) {
        mofuDate = new Date(tempDate);
    } else {
        while (!isGengDay(tempDate)) {
            tempDate.setDate(tempDate.getDate() + 1);
        }
        mofuDate = new Date(tempDate);
    }

    if (toufuDate) customs[formatDate(toufuDate)] = "初伏(头伏)";
    if (zhongfuDate) customs[formatDate(zhongfuDate)] = "中伏(二伏)";
    if (mofuDate) customs[formatDate(mofuDate)] = "末伏(三伏)";

    return customs;
}

export default function App() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [showAbout, setShowAbout] = useState(false);
    const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, content: any }>({
        visible: false, x: 0, y: 0, content: null
    });

    const startOfWeek = 1; // 1: Mon, 0: Sun
    const mode = "CHUNJIE";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayRaw = new Date(year, month, 1).getDay();
    const firstDay = startOfWeek === 1 ? (firstDayRaw === 0 ? 6 : firstDayRaw - 1) : firstDayRaw;

    const t1d = getTerm(year, month * 2);
    const t1n = solarTerm[month * 2];
    const t2d = getTerm(year, month * 2 + 1);
    const t2n = solarTerm[month * 2 + 1];

    const customs = getSpecialCustoms(year);

    const dynWest = (y: number) => {
        const br: any = {};
        const us: any = {};
        const easter = getEaster(y);
        const getRelEaster = (days: number) => {
            const d = new Date(easter);
            d.setDate(easter.getDate() + days);
            return formatDate(d);
        };

			br[getRelEaster(-50)] = "狂欢节开始(Carnival Saturday，狂欢节的庆祝从今天开始)"; //狂欢节周六 (庆祝开始) 是复活节前 50 天
		    br[getRelEaster(-47)] = "狂欢节(Carnaval,英语Carnival，也称狂欢节周二，实际上也是狂欢节最后一天。狂欢节是复活节前第49天。主要庆祝活动从之前的周五或周六开始，一直持续到圣灰星期三的前一天。)";
		    br[getRelEaster(-46)] = "圣灰星期三(Quarta-Feira de Cinzas,英语Ash Wednesday,基督教大斋期四旬期的起始日,教会于此日举行涂灰礼,用去年棕枝烧成的灰在教友额上划十字,象征悔改。)";
		    br[getRelEaster(-7)]  = "棕树主日(Palm Sunday,复活节前的一个星期日，标志着圣周的开始。它纪念耶稣骑驴荣入耶路撒冷时，民众手持棕榈枝欢呼迎接的场景。)";
		    br[getRelEaster(-3)]  = "濯足节/圣周四(Maundy Thursday,最后的晚餐的日子，耶稣在受难前夕最后晚餐上为十二门徒洗脚。)";
		    br[getRelEaster(-2)]  = "耶稣受难日/圣周五(Sexta-feira Santa / Paixão de Cristo,英语Good Friday，Good一词在古代有“神圣”、“圣洁”的意思，Good Friday即代表神圣的周五的意思。受难日是记念耶稣之死。)";
		    br[getRelEaster(-1)]  = "圣周六(Holy Saturday，纪念耶稣埋葬的日子)";
		    br[formatDate(easter)] = "复活节(Páscoa，基督教纪念耶稣基督被钉死在十字架后第三天复活的节日,象征重生与希望)";
		    br[getRelEaster(60)]  = "基督圣体节(Corpus Christi,庆祝和纪念圣体圣事——即相信在弥撒中祝圣过的饼和酒真正变成了基督的身体和血。)";
		    br[getNthDay(y, 4, 2, 0)] = "母亲节(Dia das Mães)";
		    br[getNthDay(y, 7, 2, 0)] = "父亲节(Dia dos Pais)";
		    let thanks = getNthDay(y, 10, 4, 4);
		    br[thanks] = "感恩节(Dia de Ação de Graças,受美国感恩节文化影响于1949年设立,侧重宗教仪式和家庭团,表达对过去一年收获与祝福的感恩之情)";

		    // 美国
		    us[formatDate(easter)] = "复活节(Easter,耶稣复活的日子)";
		    us[getNthDay(y, 0, 3, 1)] = "马丁·路德·金纪念日(MLK Jr. Day,纪念为黑人争取平等权利、以非暴力手段推动民权进步的领袖——马丁·路德·金牧师)";
		    us[getNthDay(y, 1, 3, 1)] = "总统日(Presidents' Day,也称华盛顿诞辰纪念日,纪念美国第一任总统乔治·华盛顿，他的生日是2月22日)";
		    us[getNthDay(y, 4, 2, 0)] = "母亲节(Mother's Day)";
		    us[getLastWeekday(y, 4, 1)] = "阵亡将士纪念日(Memorial Day,悼念在服役期间为国家捐躯的美国男女官兵。)";// 5月最后一个星期一
		    us[getNthDay(y, 5, 3, 0)] = "父亲节(Father's Day)";
		    us[getNthDay(y, 8, 1, 1)] = "劳工节(Labor Day,向所有为社会和国家做出贡献的劳动者表达敬意和感谢)";
		    us[getNthDay(y, 9, 2, 1)] = "原住民日(Indigenous Peoples' Day,之前称哥伦布日Columbus Day。现为纪念和致敬美国原住民的历史、文化与贡献的节日，之前是将哥伦布视为发现新大陆的探险英雄而称为哥伦布日)"; //10月的第二个星期一 
		    
		    us[thanks] = "感恩节(Thanksgiving Day,感恩节的由来始于1621年清教徒和原住民共享的一顿秋收大餐；现在则是家人团聚、分享感恩、享受火鸡大餐和观看游行的温馨时刻)";
		    //黑色星期五是感恩节后的第一天
		    let bf = new Date(y, 10, parseInt(thanks.split('-')[1]) + 1);
		    us[formatDate(bf)] = "黑色星期五(Black Friday,全年购物季正式开始的一天，以大幅折扣和海量抢购闻名。)";
		    // 感恩节后的第4天就是网络星期一
		    let cm = new Date(y, 10, parseInt(thanks.split('-')[1]) + 4);
			us[formatDate(cm)] = "网络星期一(Cyber Monday,黑五后的第一个星期一，主打线上商品折扣，尤其是数码产品。)";
			//let tP = thanks.split('-'); 
			//us[formatDate(new Date(y, tP[0]-1, parseInt(tP[1]) + 4))] = "网络星期一(Cyber Monday,黑五后的第一个星期一，主打线上商品折扣，尤其是数码产品。)";	
			
		    us[getLastWeekday(y, 8, 5)] = "美国原住民节(Native American Day,加州节日，旨在替代“哥伦布日”，纪念在欧洲殖民者到来前就生活在美洲的全体原住民，反思殖民历史)"; // 9月的最后一个星期五（第4个星期五）

		    return { br, us };
    };

    const currentDynWest = dynWest(year);

    const processHolidays = (database: any, curY: number, curM: number, curD: number) => {
        const cellArr: string[] = [];
        const ttArr: string[] = [];
        const birthdayData: any[] = [];

        for (const key in database) {
            const name = database[key];
            const parts = key.split('-').map(Number);
            if (parts.length === 3) {
                const startY = parts[0], m = parts[1], d = parts[2];
                if (m === curM && d === curD && curY >= startY) {
                    cellArr.push(name);
                    const age = curY - startY;
                    ttArr.push(age > 0 ? `${name}【${age}周年】` : name);
                    if (name.includes('🎂')) {
                        birthdayData.push({ year: startY, month: m, day: d, name, isLunar: false });
                    }
                }
            } else if (parts.length === 2) {
                const m = parts[0], d = parts[1];
                if (m === curM && d === curD) {
                    cellArr.push(name);
                    ttArr.push(name);
                    if (name.includes('🎂')) {
                        birthdayData.push({ month: m, day: d, name, isLunar: false });
                    }
                }
            }
        }
        return { cell: cellArr, tt: ttArr, birthdays: birthdayData };
    };

    const processLunarHolidays = (database: any, curY: number, curM: number, curD: number) => {
        const cellArr: string[] = [];
        const ttArr: string[] = [];
        const birthdayData: any[] = [];

        for (const key in database) {
            const name = database[key];
            const parts = key.split('-').map(Number);
            if (parts.length === 3) {
                const startY = parts[0], m = parts[1], d = parts[2];
                if (m === curM && d === curD && curY >= startY) {
                    cellArr.push(name);
                    const age = curY - startY;
                    ttArr.push(age > 0 ? `${name}【${age}周年】` : name);
                    if (name.includes('🎂')) {
                        birthdayData.push({ year: startY, month: m, day: d, name, isLunar: true });
                    }
                }
            } else if (parts.length === 2) {
                const m = parts[0], d = parts[1];
                if (m === curM && d === curD) {
                    cellArr.push(name);
                    ttArr.push(name);
                    if (name.includes('🎂')) {
                        birthdayData.push({ month: m, day: d, name, isLunar: true });
                    }
                }
            }
        }
        return { cell: cellArr, tt: ttArr, birthdays: birthdayData };
    };

    const getSpecialDays = (y: number, m: number, d: number, lD: Lunar) => {
        const names: string[] = [];
        const curDate = new Date(y, m, d);
        curDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(curDate.getTime() + 86400000);
        const nextL = new Lunar(tomorrow);
        if (nextL.month === 1 && nextL.day === 1) names.push("除夕");

        if ((m === month && d + 1 === t1d && t1n === "清明") || (m === month && d + 1 === t2d && t2n === "清明")) {
            names.push("寒食节");
        }

        return names;
    };

    const handleDateClick = (info: any) => {
        // Copy tooltip info to clipboard
        let copyText = `${info.s}\n${info.l}\n干支：${info.gy}年 ${info.gm}月 ${info.gd}日\n生肖：【${info.an}${info.em}】`;
        ['中国', '巴西', '美国'].forEach(cName => {
            const list = info.holidays[cName];
            if (list && list.length > 0) {
                const db = holidayDB[cName];
                const prefix = db.prefix || cName.substring(0, 1);
                list.forEach((text: string) => {
                    copyText += `\n[${prefix}] ${text}`;
                });
            }
        });

        if (info.coincide && info.coincide.length > 0) {
            copyText += `\n🎂 ${getMainName(info.birthdayName)} 重合年份：${info.coincide.join(', ')}`;
        }

        navigator.clipboard.writeText(copyText).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleMouseMove = (e: React.MouseEvent, info: any) => {
        setTooltip({
            visible: true,
            x: e.clientX + 10,
            y: e.clientY + 10,
            content: info
        });
    };

    const renderCalendar = () => {
        const rows = [];
        let dateIdx = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 6; i++) {
            const cells = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || dateIdx > daysInMonth) {
                    cells.push(<td key={`${i}-${j}`} className="empty"></td>);
                } else {
                    const curDate = new Date(year, month, dateIdx);
                    curDate.setHours(0, 0, 0, 0);
                    const lD = new Lunar(curDate);
                    const isToday = curDate.getTime() === today.getTime();
                    const isWeekend = startOfWeek === 1 ? (j >= 5) : (j === 0 || j === 6);

                    const countryData: any = {};
                    let allBirthdays: any[] = [];
                    
                    for (const cName in holidayDB) {
                        const db = holidayDB[cName];
                        let fixedDb = { ...db.fixed };
                        if (cName === "巴西") fixedDb = { ...fixedDb, ...currentDynWest.br };
                        if (cName === "美国") fixedDb = { ...fixedDb, ...currentDynWest.us };

                        const resF1 = processHolidays(fixedDb, year, month + 1, dateIdx);
                        const resF2 = processLunarHolidays(db.fixed2 || {}, lD.year, lD.month, lD.day);
                        const resV = processHolidays((db.variable && db.variable[year]) || {}, year, month + 1, dateIdx);
                        
                        countryData[cName] = {
                            cell: [...resF1.cell, ...resF2.cell, ...resV.cell].map(n => getMainName(n)),
                            tt: [...resF1.tt, ...resF2.tt, ...resV.tt]
                        };
                        allBirthdays = [...allBirthdays, ...resF1.birthdays, ...resF2.birthdays];
                    }

                    const spec = getSpecialDays(year, month, dateIdx, lD);
                    const customName = customs[formatDate(curDate)];

                    if (countryData["中国"]) {
                        countryData["中国"].cell.push(...spec.map(n => getMainName(n)));
                        countryData["中国"].tt.push(...spec);
                        if (customName) {
                            countryData["中国"].cell.push(getMainName(customName));
                            countryData["中国"].tt.push(customName);
                        }
                    }

                    const termName = (dateIdx === t1d) ? t1n : (dateIdx === t2d ? t2n : "");
                    if (termName && countryData["中国"]) {
                        if (!countryData["中国"].tt.some((t: string) => t.includes(termName))) {
                            countryData["中国"].cell.push(getMainName(termName));
                            countryData["中国"].tt.push(termName);
                        }
                    }

                    const lMonthName = (lD.isLeap ? "闰" : "") + nStr3[lD.month - 1] + "月";
                    const lDayName = lD.day === 10 ? "初十" : lD.day === 20 ? "二十" : lD.day === 30 ? "三十" : nStr2[Math.floor(lD.day / 10)] + nStr1[lD.day % 10];

                    let lText = termName || (lD.day === 1 ? lMonthName : lDayName);
                    let lStyle = termName ? { color: "#d32f2f", fontWeight: "bold" } : (lD.day === 1 ? { color: "#1565c0", fontWeight: "bold" } : {});

                    const mGZIdx = (year - 1900) * 12 + month + 12 + (dateIdx >= t1d ? 1 : 0);
                    const gzYInfo = getGZData(curDate, mode);

                    let coincide: number[] = [];
                    let birthdayName = "";
                    if (allBirthdays.length > 0 && allBirthdays[0].year) {
                        coincide = getCoincidingYears(allBirthdays[0].year, allBirthdays[0].month, allBirthdays[0].day, allBirthdays[0].isLunar);
                        birthdayName = allBirthdays[0].name;
                    }

                    const info: any = {
                        s: `${year}年${month + 1}月${dateIdx}日`,
                        l: lMonthName + lDayName,
                        gy: gzYInfo.gz,
                        gm: Gan[mGZIdx % 10] + Zhi[mGZIdx % 12],
                        gd: getGZDay(curDate).name,
                        an: gzYInfo.an,
                        em: gzYInfo.em,
                        birthdays: allBirthdays,
                        dateIdx,
                        holidays: {},
                        coincide,
                        birthdayName
                    };
                    for (const cName in countryData) {
                        info.holidays[cName] = countryData[cName].tt;
                    }

                    const currentIdx = dateIdx;
                    cells.push(
                        <td 
                            key={`${i}-${j}`} 
                            className={isToday ? "today" : ""}
                            onMouseMove={(e) => handleMouseMove(e, info)}
                            onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                            onClick={() => handleDateClick(info)}
                        >
                            <span className="s-num" style={isWeekend ? { color: "var(--china-red)" } : {}}>{dateIdx}</span>
                            <span className="l-txt" style={lStyle}>{lText}</span>
                            <div className="h-container">
                                {['中国', '巴西', '美国'].map(cName => {
                                    const data = countryData[cName];
                                    if (!data) return null;
                                    const db = holidayDB[cName];
                                    return data.cell.map((name, idx) => {
                                        const fullTT = data.tt[idx];
                                        const isBirthday = fullTT?.includes('🎂');
                                        const isMemorial = fullTT?.includes('🕯') || fullTT?.includes('忌日');
                                        const cls = isMemorial ? "tag-blackfriday" : (isBirthday ? "tag-family" : db.css);
                                        return (
                                            <span key={`${cName}-${idx}`} className={`h-tag ${cls}`}>
                                                <span>{name}</span>
                                            </span>
                                        );
                                    });
                                })}
                            </div>
                        </td>
                    );
                    dateIdx++;
                }
            }
            rows.push(<tr key={i}>{cells}</tr>);
            if (dateIdx > daysInMonth) break;
        }
        return rows;
    };

    return (
        <div className="calendar-box">
            <div className="header">
                <p className="title-main">中国农历万年历</p>
                <h1 className="title-sub">(中国/巴西/美国节假日自适应版)</h1>
                <div className="h-row">
                    <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                        {Array.from({ length: 200 }, (_, i) => 1901 + i).map(y => (
                            <option key={y} value={y}>{y}年</option>
                        ))}
                    </select>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => i).map(m => (
                            <option key={m} value={m}>{m + 1}月</option>
                        ))}
                    </select>
                </div>
                <div className="gz-info">
                    {getGZData(new Date(year, month, 1), mode).gz}年 【{getGZData(new Date(year, month, 1), mode).an}{getGZData(new Date(year, month, 1), mode).em}】
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        {['一', '二', '三', '四', '五', '六', '日'].map((w, i) => (
                            <th key={i} style={i >= 5 ? { color: "var(--china-red)" } : {}}>{w}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {renderCalendar()}
                </tbody>
            </table>

            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', background: '#fafafa' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setYear(y => Math.max(1901, y - 1))}>&lt;年</button>
                    <button onClick={() => {
                        if (month > 0) setMonth(month - 1);
                        else { setMonth(11); setYear(y => Math.max(1901, y - 1)); }
                    }}>&lt;月</button>
                    <button onClick={() => {
                        const n = new Date();
                        setYear(n.getFullYear());
                        setMonth(n.getMonth());
                    }}>今</button>
                    <button onClick={() => {
                        if (month < 11) setMonth(month + 1);
                        else { setMonth(0); setYear(y => Math.min(2100, y + 1)); }
                    }}>月&gt;</button>
                    <button onClick={() => setYear(y => Math.min(2100, y + 1))}>年&gt;</button>
                </div>
                <button onClick={() => setShowAbout(true)}>关于</button>
            </div>

            {tooltip.visible && (
                <div id="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    <div className="tt-main"><strong>{tooltip.content.s}</strong><br />{tooltip.content.l}</div>
                    <div className="tt-gz">干支：{tooltip.content.gy}年 {tooltip.content.gm}月 {tooltip.content.gd}日</div>
                    <div className="tt-an">生肖：【{tooltip.content.an}{tooltip.content.em}】</div>
                    {['中国', '巴西', '美国'].map(cName => {
                        const db = holidayDB[cName];
                        const list = tooltip.content.holidays[cName];
                        if (!list || list.length === 0) return null;
                        const prefix = db.prefix || cName.substring(0, 1);
                        const cls = `tt-${db.css.split('-')[1]}`;
                        return (
                            <div key={cName} className={cls}>
                                {list.map((text: string, idx: number) => (
                                    <div key={idx}>[{prefix}] {text}</div>
                                ))}
                            </div>
                        );
                    })}
                    
                    {tooltip.content.coincide && tooltip.content.coincide.length > 0 && (
                        <div className="tt-coincide">
                            🎂 {getMainName(tooltip.content.birthdayName)} 重合年份：
                            <div style={{ fontSize: '10px', marginTop: '2px', color: '#fff' }}>
                                {tooltip.content.coincide.join(', ')}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showAbout && (
                <div className="modal-overlay" onClick={() => setShowAbout(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <span className="close-btn" onClick={() => setShowAbout(false)}>&times;</span>
                        <h3 style={{ color: '#1b5e20', marginTop: 0 }}>程序信息</h3>
                        <p style={{ fontSize: '13px' }}><strong>名称：</strong> 中国农历万年历</p>
                        <p style={{ fontSize: '13px' }}><strong>版本：</strong> v1.7.1 (React版)</p>
                        <p style={{ fontSize: '13px' }}><strong>功能：</strong> 自动计算生日公历农历重合年份，支持完整节日介绍显示。</p>
                        <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>© 2026 Gemini 协作开发</p>
                    </div>
                </div>
            )}
        </div>
    );
}
