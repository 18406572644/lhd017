import type { OCRResult, PrescriptionMedicine } from '@/types/prescription'
import type { Medicine } from '@/types/medicine'

interface MedicineTemplate {
  name: string
  aliases: string[]
  specification: string
  commonDosages: string[]
  commonFrequencies: string[]
  category: string
  typicalDays: number
  typicalQuantity: number
}

const medicineTemplates: MedicineTemplate[] = [
  {
    name: '阿莫西林胶囊',
    aliases: ['阿莫西林', '阿莫仙', '阿莫灵', '阿莫西林克拉维酸钾'],
    specification: '0.25g*24粒',
    commonDosages: ['一次0.25g', '一次0.5g', '一次1粒'],
    commonFrequencies: ['一日3次', '一日4次', '每6小时1次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '头孢克肟分散片',
    aliases: ['头孢克肟', '世福素', '头孢克肟片'],
    specification: '0.1g*6片',
    commonDosages: ['一次0.1g', '一次0.2g', '一次1片'],
    commonFrequencies: ['一日2次', '一日1次'],
    category: '抗生素',
    typicalDays: 5,
    typicalQuantity: 2,
  },
  {
    name: '头孢呋辛酯片',
    aliases: ['头孢呋辛', '西力欣', '头孢呋辛酯'],
    specification: '0.25g*12片',
    commonDosages: ['一次0.25g', '一次0.5g', '一次1片'],
    commonFrequencies: ['一日2次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '头孢克洛胶囊',
    aliases: ['头孢克洛', '希刻劳', '头孢克洛片'],
    specification: '0.25g*6粒',
    commonDosages: ['一次0.25g', '一次1粒'],
    commonFrequencies: ['一日3次', '一日4次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '阿奇霉素片',
    aliases: ['阿奇霉素', '希舒美', '阿奇霉素分散片'],
    specification: '0.25g*6片',
    commonDosages: ['一次0.25g', '一次0.5g', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗生素',
    typicalDays: 5,
    typicalQuantity: 1,
  },
  {
    name: '罗红霉素胶囊',
    aliases: ['罗红霉素', '罗力得', '罗红霉素片'],
    specification: '0.15g*12粒',
    commonDosages: ['一次0.15g', '一次0.3g', '一次1粒'],
    commonFrequencies: ['一日2次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '左氧氟沙星片',
    aliases: ['左氧氟沙星', '可乐必妥', '盐酸左氧氟沙星', '左旋氧氟沙星'],
    specification: '0.5g*4片',
    commonDosages: ['一次0.5g', '一次0.2g', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '诺氟沙星胶囊',
    aliases: ['诺氟沙星', '氟哌酸', '诺氟沙星片'],
    specification: '0.1g*24粒',
    commonDosages: ['一次0.2g', '一次0.4g', '一次2粒'],
    commonFrequencies: ['一日2次', '一日3次'],
    category: '抗生素',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '奥美拉唑肠溶胶囊',
    aliases: ['奥美拉唑', '洛赛克', '奥克', '奥美拉唑镁肠溶片'],
    specification: '20mg*14粒',
    commonDosages: ['一次20mg', '一次40mg', '一次1粒'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '兰索拉唑肠溶片',
    aliases: ['兰索拉唑', '达克普隆', '兰索拉唑片'],
    specification: '30mg*14片',
    commonDosages: ['一次30mg', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '雷贝拉唑钠肠溶片',
    aliases: ['雷贝拉唑', '波利特', '瑞波特'],
    specification: '10mg*14片',
    commonDosages: ['一次10mg', '一次20mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '泮托拉唑钠肠溶片',
    aliases: ['泮托拉唑', '潘妥洛克', '泮立苏'],
    specification: '40mg*14片',
    commonDosages: ['一次40mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '硝苯地平缓释片',
    aliases: ['硝苯地平', '拜新同', '伲福达', '心痛定'],
    specification: '10mg*30片',
    commonDosages: ['一次10mg', '一次20mg', '一次30mg', '一次1片'],
    commonFrequencies: ['一日2次', '一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '氨氯地平片',
    aliases: ['氨氯地平', '络活喜', '安内真', '苯磺酸氨氯地平'],
    specification: '5mg*7片',
    commonDosages: ['一次5mg', '一次2.5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '缬沙坦胶囊',
    aliases: ['缬沙坦', '代文', '穗悦', '缬沙坦片'],
    specification: '80mg*7粒',
    commonDosages: ['一次80mg', '一次160mg', '一次1粒'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '厄贝沙坦片',
    aliases: ['厄贝沙坦', '安博维', '吉加', '厄贝沙坦胶囊'],
    specification: '150mg*7片',
    commonDosages: ['一次150mg', '一次300mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '氯沙坦钾片',
    aliases: ['氯沙坦', '科素亚', '氯沙坦钾'],
    specification: '50mg*7片',
    commonDosages: ['一次50mg', '一次100mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '盐酸二甲双胍片',
    aliases: ['二甲双胍', '格华止', '美迪康', '盐酸二甲双胍缓释片'],
    specification: '0.5g*20片',
    commonDosages: ['一次0.5g', '一次0.85g', '一次1片'],
    commonFrequencies: ['一日2次', '一日3次'],
    category: '糖尿病',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '格列美脲片',
    aliases: ['格列美脲', '亚莫利', '格列美脲胶囊'],
    specification: '2mg*30片',
    commonDosages: ['一次1mg', '一次2mg', '一次4mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '糖尿病',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '阿卡波糖片',
    aliases: ['阿卡波糖', '拜糖平', '卡博平', '阿卡波糖胶囊'],
    specification: '50mg*30片',
    commonDosages: ['一次50mg', '一次100mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '糖尿病',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '瑞格列奈片',
    aliases: ['瑞格列奈', '诺和龙', '孚来迪'],
    specification: '1mg*30片',
    commonDosages: ['一次0.5mg', '一次1mg', '一次2mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '糖尿病',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '盐酸吡格列酮片',
    aliases: ['吡格列酮', '艾可拓', '卡司平', '吡格列酮胶囊'],
    specification: '15mg*7片',
    commonDosages: ['一次15mg', '一次30mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '糖尿病',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '布洛芬缓释胶囊',
    aliases: ['布洛芬', '芬必得', '安瑞克', '布洛芬片'],
    specification: '0.3g*20粒',
    commonDosages: ['一次0.3g', '一次0.6g', '一次1粒'],
    commonFrequencies: ['一日2次', '每12小时1次'],
    category: '解热镇痛',
    typicalDays: 5,
    typicalQuantity: 1,
  },
  {
    name: '对乙酰氨基酚片',
    aliases: ['对乙酰氨基酚', '扑热息痛', '泰诺林', '必理通'],
    specification: '0.5g*12片',
    commonDosages: ['一次0.5g', '一次1片'],
    commonFrequencies: ['一日3次', '一日4次', '每4-6小时1次'],
    category: '解热镇痛',
    typicalDays: 5,
    typicalQuantity: 1,
  },
  {
    name: '双氯芬酸钠缓释片',
    aliases: ['双氯芬酸钠', '扶他林', '戴芬', '双氯灭痛'],
    specification: '75mg*10片',
    commonDosages: ['一次75mg', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '解热镇痛',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '塞来昔布胶囊',
    aliases: ['塞来昔布', '西乐葆', '塞来昔布片'],
    specification: '0.2g*6粒',
    commonDosages: ['一次0.2g', '一次0.1g', '一次1粒'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '解热镇痛',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '氯雷他定片',
    aliases: ['氯雷他定', '开瑞坦', '息斯敏', '氯雷他定胶囊'],
    specification: '10mg*6片',
    commonDosages: ['一次10mg', '一次5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗过敏',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '盐酸西替利嗪片',
    aliases: ['西替利嗪', '仙特明', '贝分', '盐酸西替利嗪'],
    specification: '10mg*12片',
    commonDosages: ['一次10mg', '一次5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗过敏',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '马来酸氯苯那敏片',
    aliases: ['氯苯那敏', '扑尔敏', '马来酸氯苯那敏'],
    specification: '4mg*100片',
    commonDosages: ['一次4mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '抗过敏',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '盐酸左西替利嗪片',
    aliases: ['左西替利嗪', '优泽', '盐酸左西替利嗪'],
    specification: '5mg*7片',
    commonDosages: ['一次5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗过敏',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '孟鲁司特钠咀嚼片',
    aliases: ['孟鲁司特', '顺尔宁', '孟鲁司特钠'],
    specification: '10mg*5片',
    commonDosages: ['一次10mg', '一次5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '呼吸系统',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '布地奈德福莫特罗粉吸入剂',
    aliases: ['布地奈德福莫特罗', '信必可', '信必可都保'],
    specification: '160μg/4.5μg*60吸',
    commonDosages: ['一次1吸', '一次2吸'],
    commonFrequencies: ['一日2次'],
    category: '呼吸系统',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '沙美特罗替卡松粉吸入剂',
    aliases: ['沙美特罗替卡松', '舒利迭', '舒利迭准纳器'],
    specification: '50μg/250μg*60吸',
    commonDosages: ['一次1吸'],
    commonFrequencies: ['一日2次'],
    category: '呼吸系统',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '氨溴索口服溶液',
    aliases: ['氨溴索', '沐舒坦', '兰苏', '盐酸氨溴索'],
    specification: '100ml:0.3g',
    commonDosages: ['一次10ml', '一次5ml'],
    commonFrequencies: ['一日3次'],
    category: '呼吸系统',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '乙酰半胱氨酸泡腾片',
    aliases: ['乙酰半胱氨酸', '富露施', '痰易净'],
    specification: '0.6g*4片',
    commonDosages: ['一次0.6g', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '呼吸系统',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '复方甘草片',
    aliases: ['复方甘草', '甘草片'],
    specification: '100片/瓶',
    commonDosages: ['一次3片', '一次2片'],
    commonFrequencies: ['一日3次'],
    category: '呼吸系统',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '氢溴酸右美沙芬片',
    aliases: ['右美沙芬', '美沙芬', '普西兰'],
    specification: '15mg*12片',
    commonDosages: ['一次15mg', '一次30mg', '一次1片'],
    commonFrequencies: ['一日3次', '一日4次'],
    category: '呼吸系统',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '多潘立酮片',
    aliases: ['多潘立酮', '吗丁啉', '多潘立酮片'],
    specification: '10mg*30片',
    commonDosages: ['一次10mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '枸橼酸莫沙必利片',
    aliases: ['莫沙必利', '快力', '加斯清'],
    specification: '5mg*24片',
    commonDosages: ['一次5mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '铝碳酸镁咀嚼片',
    aliases: ['铝碳酸镁', '达喜', '铝碳酸镁片'],
    specification: '0.5g*20片',
    commonDosages: ['一次0.5g', '一次1.0g', '一次1-2片'],
    commonFrequencies: ['一日3次', '一日4次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '蒙脱石散',
    aliases: ['蒙脱石', '思密达', '必奇', '蒙脱石散剂'],
    specification: '3g*10袋',
    commonDosages: ['一次3g', '一次1袋'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 5,
    typicalQuantity: 2,
  },
  {
    name: '小檗碱片',
    aliases: ['黄连素', '盐酸小檗碱', '小檗碱'],
    specification: '0.1g*24片',
    commonDosages: ['一次0.1g', '一次0.2g', '一次1-2片'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 5,
    typicalQuantity: 2,
  },
  {
    name: '复方消化酶胶囊',
    aliases: ['消化酶', '达吉', '复方消化酶'],
    specification: '20粒/盒',
    commonDosages: ['一次1粒', '一次2粒'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '匹维溴铵片',
    aliases: ['匹维溴铵', '得舒特', '匹维溴胺'],
    specification: '50mg*15片',
    commonDosages: ['一次50mg', '一次100mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '消化系统',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '阿托伐他汀钙片',
    aliases: ['阿托伐他汀', '立普妥', '阿乐', '阿托伐他汀钙'],
    specification: '20mg*7片',
    commonDosages: ['一次10mg', '一次20mg', '一次40mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '瑞舒伐他汀钙片',
    aliases: ['瑞舒伐他汀', '可定', '舒夫坦', '瑞舒伐他汀钙'],
    specification: '10mg*7片',
    commonDosages: ['一次5mg', '一次10mg', '一次20mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '辛伐他汀片',
    aliases: ['辛伐他汀', '舒降之', '辛伐他汀胶囊'],
    specification: '20mg*7片',
    commonDosages: ['一次10mg', '一次20mg', '一次40mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '阿司匹林肠溶片',
    aliases: ['阿司匹林', '拜阿司匹灵', '阿斯匹林', '肠溶阿司匹林'],
    specification: '100mg*30片',
    commonDosages: ['一次100mg', '一次75mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '氯吡格雷片',
    aliases: ['氯吡格雷', '波立维', '泰嘉', '硫酸氢氯吡格雷'],
    specification: '75mg*7片',
    commonDosages: ['一次75mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '替格瑞洛片',
    aliases: ['替格瑞洛', '倍林达'],
    specification: '90mg*14片',
    commonDosages: ['一次90mg', '一次1片'],
    commonFrequencies: ['一日2次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '美托洛尔缓释片',
    aliases: ['美托洛尔', '倍他乐克', '酒石酸美托洛尔', '琥珀酸美托洛尔'],
    specification: '47.5mg*7片',
    commonDosages: ['一次47.5mg', '一次95mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 4,
  },
  {
    name: '比索洛尔片',
    aliases: ['比索洛尔', '康忻', '博苏', '富马酸比索洛尔'],
    specification: '5mg*10片',
    commonDosages: ['一次2.5mg', '一次5mg', '一次10mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '螺内酯片',
    aliases: ['螺内酯', '安体舒通', '螺内酯胶囊'],
    specification: '20mg*100片',
    commonDosages: ['一次20mg', '一次40mg', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '呋塞米片',
    aliases: ['呋塞米', '速尿', '呋喃苯胺酸'],
    specification: '20mg*100片',
    commonDosages: ['一次20mg', '一次40mg', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '心血管',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '氢氯噻嗪片',
    aliases: ['氢氯噻嗪', '双氢克尿噻', '双克', '双氢氯噻嗪'],
    specification: '25mg*100片',
    commonDosages: ['一次12.5mg', '一次25mg', '一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 1,
  },
  {
    name: '特拉唑嗪片',
    aliases: ['特拉唑嗪', '高特灵', '盐酸特拉唑嗪'],
    specification: '2mg*14片',
    commonDosages: ['一次1mg', '一次2mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '心血管',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '普适泰片',
    aliases: ['普适泰', '舍尼通'],
    specification: '10片/盒',
    commonDosages: ['一次1片'],
    commonFrequencies: ['一日2次'],
    category: '泌尿系统',
    typicalDays: 30,
    typicalQuantity: 6,
  },
  {
    name: '坦索罗辛缓释胶囊',
    aliases: ['坦索罗辛', '哈乐', '齐索', '盐酸坦索罗辛'],
    specification: '0.2mg*10粒',
    commonDosages: ['一次0.2mg', '一次1粒'],
    commonFrequencies: ['一日1次'],
    category: '泌尿系统',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '非那雄胺片',
    aliases: ['非那雄胺', '保列治', '保法止'],
    specification: '5mg*10片',
    commonDosages: ['一次5mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '泌尿系统',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '艾司唑仑片',
    aliases: ['艾司唑仑', '舒乐安定', '三唑氯安定'],
    specification: '1mg*20片',
    commonDosages: ['一次1mg', '一次2mg', '一次1-2片'],
    commonFrequencies: ['一日3次', '睡前1次'],
    category: '精神神经',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '阿普唑仑片',
    aliases: ['阿普唑仑', '佳静安定', '甲基三唑安定'],
    specification: '0.4mg*20片',
    commonDosages: ['一次0.4mg', '一次0.8mg', '一次1-2片'],
    commonFrequencies: ['一日3次', '睡前1次'],
    category: '精神神经',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '佐匹克隆片',
    aliases: ['佐匹克隆', '忆梦返', '三辰'],
    specification: '7.5mg*12片',
    commonDosages: ['一次3.75mg', '一次7.5mg', '一次1片'],
    commonFrequencies: ['睡前1次'],
    category: '精神神经',
    typicalDays: 14,
    typicalQuantity: 1,
  },
  {
    name: '氟哌噻吨美利曲辛片',
    aliases: ['氟哌噻吨美利曲辛', '黛力新'],
    specification: '20片/盒',
    commonDosages: ['一次1片'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '甲钴胺片',
    aliases: ['甲钴胺', '弥可保', '甲钴胺胶囊'],
    specification: '0.5mg*20片',
    commonDosages: ['一次0.5mg', '一次1片'],
    commonFrequencies: ['一日3次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '加巴喷丁胶囊',
    aliases: ['加巴喷丁', '迭力', '派汀'],
    specification: '0.1g*48粒',
    commonDosages: ['一次0.3g', '一次0.1g', '一次1-3粒'],
    commonFrequencies: ['一日3次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '氟康唑胶囊',
    aliases: ['氟康唑', '大扶康', '氟康唑片'],
    specification: '150mg*3粒',
    commonDosages: ['一次150mg', '一次1粒'],
    commonFrequencies: ['一日1次', '每3日1次'],
    category: '抗真菌',
    typicalDays: 7,
    typicalQuantity: 1,
  },
  {
    name: '伊曲康唑胶囊',
    aliases: ['伊曲康唑', '斯皮仁诺', '伊曲康唑片'],
    specification: '0.1g*7粒',
    commonDosages: ['一次0.1g', '一次0.2g', '一次1-2粒'],
    commonFrequencies: ['一日1次', '一日2次'],
    category: '抗真菌',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '特比萘芬片',
    aliases: ['特比萘芬', '兰美抒', '丁克', '盐酸特比萘芬'],
    specification: '0.25g*7片',
    commonDosages: ['一次0.25g', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗真菌',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '阿昔洛韦片',
    aliases: ['阿昔洛韦', '无环鸟苷', '克毒星'],
    specification: '0.1g*24片',
    commonDosages: ['一次0.2g', '一次0.4g', '一次2-4片'],
    commonFrequencies: ['一日5次', '一日3次'],
    category: '抗病毒',
    typicalDays: 7,
    typicalQuantity: 3,
  },
  {
    name: '更昔洛韦胶囊',
    aliases: ['更昔洛韦', '丽科乐', '赛美维'],
    specification: '0.25g*12粒',
    commonDosages: ['一次0.5g', '一次0.25g', '一次1-2粒'],
    commonFrequencies: ['一日3次'],
    category: '抗病毒',
    typicalDays: 14,
    typicalQuantity: 4,
  },
  {
    name: '磷酸奥司他韦胶囊',
    aliases: ['奥司他韦', '达菲', '可威'],
    specification: '75mg*10粒',
    commonDosages: ['一次75mg', '一次1粒'],
    commonFrequencies: ['一日2次'],
    category: '抗病毒',
    typicalDays: 5,
    typicalQuantity: 1,
  },
  {
    name: '利巴韦林颗粒',
    aliases: ['利巴韦林', '病毒唑', '三氮唑核苷'],
    specification: '0.1g*18袋',
    commonDosages: ['一次0.15g', '一次0.3g', '一次1-2袋'],
    commonFrequencies: ['一日3次'],
    category: '抗病毒',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '桂枝茯苓胶囊',
    aliases: ['桂枝茯苓', '桂枝茯苓丸'],
    specification: '0.31g*60粒',
    commonDosages: ['一次3粒', '一次4粒'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '血塞通胶囊',
    aliases: ['血塞通', '血塞通片'],
    specification: '0.1g*24粒',
    commonDosages: ['一次0.1g', '一次0.2g', '一次1-2粒'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '复方丹参滴丸',
    aliases: ['复方丹参', '丹参滴丸'],
    specification: '27mg*180丸',
    commonDosages: ['一次10丸', '一次8丸'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '速效救心丸',
    aliases: ['救心丸'],
    specification: '40mg*60丸',
    commonDosages: ['一次4-6丸', '含服一次10-15丸'],
    commonFrequencies: ['一日3次', '发作时含服'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '六味地黄丸',
    aliases: ['六味地黄'],
    specification: '0.18g*120丸',
    commonDosages: ['一次8丸', '一次10丸'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '逍遥丸',
    aliases: ['逍遥散'],
    specification: '9g*10袋',
    commonDosages: ['一次1袋', '一次6-9g'],
    commonFrequencies: ['一日2次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '百令胶囊',
    aliases: ['百令', '金水宝胶囊'],
    specification: '0.5g*42粒',
    commonDosages: ['一次5粒', '一次2-6粒'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '康复新液',
    aliases: ['康复新'],
    specification: '100ml/瓶',
    commonDosages: ['一次10ml', '一次5ml'],
    commonFrequencies: ['一日3次'],
    category: '中成药',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '枸地氯雷他定片',
    aliases: ['枸地氯雷他定', '地氯雷他定', '恩理思'],
    specification: '8.8mg*6片',
    commonDosages: ['一次8.8mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '抗过敏',
    typicalDays: 7,
    typicalQuantity: 2,
  },
  {
    name: '甲磺酸倍他司汀片',
    aliases: ['倍他司汀', '敏使朗', '培他啶'],
    specification: '6mg*30片',
    commonDosages: ['一次6mg', '一次12mg', '一次1-2片'],
    commonFrequencies: ['一日3次'],
    category: '心血管',
    typicalDays: 14,
    typicalQuantity: 2,
  },
  {
    name: '盐酸氟桂利嗪胶囊',
    aliases: ['氟桂利嗪', '西比灵', '氟桂嗪'],
    specification: '5mg*20粒',
    commonDosages: ['一次5mg', '一次10mg', '一次1-2粒'],
    commonFrequencies: ['睡前1次', '一日1次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 2,
  },
  {
    name: '盐酸帕罗西汀片',
    aliases: ['帕罗西汀', '赛乐特', '舒坦罗'],
    specification: '20mg*10片',
    commonDosages: ['一次20mg', '一次1片'],
    commonFrequencies: ['一日1次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 3,
  },
  {
    name: '盐酸舍曲林片',
    aliases: ['舍曲林', '左洛复', '唯他停'],
    specification: '50mg*14片',
    commonDosages: ['一次50mg', '一次100mg', '一次1-2片'],
    commonFrequencies: ['一日1次'],
    category: '精神神经',
    typicalDays: 30,
    typicalQuantity: 2,
  },
]

const mockDoctorNames = [
  '张医生', '李医生', '王医生', '刘医生', '陈医生',
  '杨医生', '赵医生', '黄医生', '周医生', '吴医生',
]

const mockDepartments = [
  '内科', '外科', '儿科', '妇科', '骨科',
  '心内科', '内分泌科', '呼吸内科', '消化内科', '神经内科',
  '皮肤科', '眼科', '耳鼻喉科', '口腔科', '泌尿外科',
]

const mockHospitalNames = [
  '市第一人民医院', '市中心医院', '市第二人民医院', '市中医院',
  '医科大学附属医院', '协和医院', '人民医院', '中西医结合医院',
  '省人民医院', '市第三人民医院',
]

const mockDiagnoses = [
  { name: '上呼吸道感染', categories: ['outpatient', 'emergency'], medicines: ['阿莫西林胶囊', '头孢克肟分散片', '布洛芬缓释胶囊', '复方甘草片', '氨溴索口服溶液'] },
  { name: '高血压', categories: ['chronic', 'outpatient'], medicines: ['硝苯地平缓释片', '氨氯地平片', '缬沙坦胶囊', '厄贝沙坦片', '氯沙坦钾片', '美托洛尔缓释片', '比索洛尔片', '氢氯噻嗪片'] },
  { name: '2型糖尿病', categories: ['chronic'], medicines: ['盐酸二甲双胍片', '格列美脲片', '阿卡波糖片', '瑞格列奈片', '盐酸吡格列酮片', '胰岛素注射液'] },
  { name: '急性支气管炎', categories: ['outpatient', 'emergency'], medicines: ['头孢克洛胶囊', '阿奇霉素片', '左氧氟沙星片', '氨溴索口服溶液', '乙酰半胱氨酸泡腾片', '氢溴酸右美沙芬片'] },
  { name: '慢性胃炎', categories: ['outpatient'], medicines: ['奥美拉唑肠溶胶囊', '兰索拉唑肠溶片', '雷贝拉唑钠肠溶片', '铝碳酸镁咀嚼片', '枸橼酸莫沙必利片', '复方消化酶胶囊', '多潘立酮片'] },
  { name: '急性胃肠炎', categories: ['outpatient', 'emergency'], medicines: ['诺氟沙星胶囊', '蒙脱石散', '小檗碱片', '奥美拉唑肠溶胶囊', '双歧杆菌四联活菌片', '口服补液盐'] },
  { name: '过敏性鼻炎', categories: ['outpatient'], medicines: ['氯雷他定片', '盐酸西替利嗪片', '枸地氯雷他定片', '布地奈德鼻喷雾剂', '孟鲁司特钠咀嚼片'] },
  { name: '过敏性皮炎', categories: ['outpatient'], medicines: ['氯雷他定片', '盐酸左西替利嗪片', '马来酸氯苯那敏片', '复方甘草酸苷片', '糠酸莫米松乳膏', '炉甘石洗剂'] },
  { name: '类风湿性关节炎', categories: ['chronic', 'outpatient'], medicines: ['双氯芬酸钠缓释片', '塞来昔布胶囊', '布洛芬缓释胶囊', '甲氨蝶呤片', '来氟米特片', '硫酸羟氯喹片'] },
  { name: '冠心病', categories: ['chronic', 'outpatient'], medicines: ['阿司匹林肠溶片', '氯吡格雷片', '替格瑞洛片', '阿托伐他汀钙片', '瑞舒伐他汀钙片', '美托洛尔缓释片', '硝酸甘油片'] },
  { name: '高血脂症', categories: ['chronic'], medicines: ['阿托伐他汀钙片', '瑞舒伐他汀钙片', '辛伐他汀片', '非诺贝特胶囊', '血脂康胶囊'] },
  { name: '偏头痛', categories: ['outpatient'], medicines: ['布洛芬缓释胶囊', '对乙酰氨基酚片', '双氯芬酸钠缓释片', '盐酸氟桂利嗪胶囊', '佐米曲普坦片'] },
  { name: '失眠症', categories: ['outpatient'], medicines: ['艾司唑仑片', '阿普唑仑片', '佐匹克隆片', '右佐匹克隆片', '百乐眠胶囊', '乌灵胶囊'] },
  { name: '焦虑症', categories: ['outpatient', 'chronic'], medicines: ['阿普唑仑片', '艾司唑仑片', '氟哌噻吨美利曲辛片', '盐酸帕罗西汀片', '盐酸舍曲林片'] },
  { name: '腰椎间盘突出症', categories: ['outpatient'], medicines: ['双氯芬酸钠缓释片', '塞来昔布胶囊', '布洛芬缓释胶囊', '甲钴胺片', '加巴喷丁胶囊', '腰痛宁胶囊'] },
  { name: '颈椎病', categories: ['outpatient'], medicines: ['双氯芬酸钠缓释片', '塞来昔布胶囊', '布洛芬缓释胶囊', '甲钴胺片', '盐酸氟桂利嗪胶囊', '颈复康颗粒'] },
  { name: '前列腺增生症', categories: ['chronic', 'outpatient'], medicines: ['坦索罗辛缓释胶囊', '非那雄胺片', '普适泰片', '特拉唑嗪片'] },
  { name: '尿路感染', categories: ['outpatient', 'emergency'], medicines: ['左氧氟沙星片', '诺氟沙星胶囊', '头孢克肟分散片', '呋喃妥因肠溶片', '三金片', '热淋清颗粒'] },
  { name: '阴道炎', categories: ['outpatient'], medicines: ['氟康唑胶囊', '甲硝唑片', '克霉唑阴道片', '硝酸咪康唑栓', '洁尔阴洗液'] },
  { name: '带状疱疹', categories: ['outpatient'], medicines: ['阿昔洛韦片', '更昔洛韦胶囊', '甲钴胺片', '加巴喷丁胶囊', '普瑞巴林胶囊', '阿昔洛韦乳膏'] },
  { name: '流行性感冒', categories: ['outpatient', 'emergency'], medicines: ['磷酸奥司他韦胶囊', '布洛芬缓释胶囊', '对乙酰氨基酚片', '利巴韦林颗粒', '复方氨酚烷胺片', '连花清瘟胶囊'] },
  { name: '支气管哮喘', categories: ['chronic', 'outpatient'], medicines: ['布地奈德福莫特罗粉吸入剂', '沙美特罗替卡松粉吸入剂', '孟鲁司特钠咀嚼片', '硫酸沙丁胺醇气雾剂', '氨茶碱片'] },
  { name: '慢性阻塞性肺疾病', categories: ['chronic'], medicines: ['布地奈德福莫特罗粉吸入剂', '沙美特罗替卡松粉吸入剂', '噻托溴铵粉吸入剂', '氨溴索口服溶液', '乙酰半胱氨酸泡腾片'] },
  { name: '胃食管反流病', categories: ['chronic', 'outpatient'], medicines: ['奥美拉唑肠溶胶囊', '兰索拉唑肠溶片', '雷贝拉唑钠肠溶片', '泮托拉唑钠肠溶片', '枸橼酸莫沙必利片', '铝碳酸镁咀嚼片'] },
  { name: '胃溃疡', categories: ['outpatient'], medicines: ['奥美拉唑肠溶胶囊', '兰索拉唑肠溶片', '雷贝拉唑钠肠溶片', '泮托拉唑钠肠溶片', '铝碳酸镁咀嚼片', '枸橼酸铋钾胶囊', '阿莫西林胶囊', '克拉霉素片'] },
]

const mockPatientNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '冯十二', '陈小明', '刘小红', '杨小华', '黄小丽', '周小强']

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomDate(daysFromNow: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0

  let matches = 0
  const len1 = s1.length
  const len2 = s2.length
  const maxLen = Math.max(len1, len2)

  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (s1[i] === s2[i]) matches++
  }

  if (s2.includes(s1) || s1.includes(s2)) {
    matches += Math.min(len1, len2) * 0.5
  }

  return Math.min(matches / maxLen, 1)
}

function findBestMedicineMatch(text: string): { template: MedicineTemplate; confidence: number } | null {
  let bestMatch: MedicineTemplate | null = null
  let highestConfidence = 0

  for (const template of medicineTemplates) {
    let maxConfidence = stringSimilarity(text, template.name)

    for (const alias of template.aliases) {
      const aliasConfidence = stringSimilarity(text, alias)
      if (aliasConfidence > maxConfidence) {
        maxConfidence = aliasConfidence
      }
    }

    if (maxConfidence > highestConfidence && maxConfidence >= 0.3) {
      highestConfidence = maxConfidence
      bestMatch = template
    }
  }

  return bestMatch ? { template: bestMatch, confidence: highestConfidence } : null
}

function generatePrescriptionCode(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 900 + 100)
  return `RX${year}${month}${day}${random}`
}

interface AnalyzeImageResult {
  medicineCount: number
  likelyDiagnosis: typeof mockDiagnoses[0]
  handwritingQuality: 'poor' | 'medium' | 'good'
  layoutComplexity: 'simple' | 'medium' | 'complex'
  imageQuality: number
}

function analyzeImageContent(imageBase64: string): AnalyzeImageResult {
  const hash = imageBase64.slice(-50)
  let hashValue = 0
  for (let i = 0; i < hash.length; i++) {
    hashValue += hash.charCodeAt(i) * (i + 1)
  }

  const medicineCount = (hashValue % 4) + 2

  const diagnosisIndex = hashValue % mockDiagnoses.length
  const likelyDiagnosis = mockDiagnoses[diagnosisIndex]

  const qualityValues = ['poor', 'medium', 'good'] as const
  const handwritingQuality = qualityValues[hashValue % 3]

  const complexityValues = ['simple', 'medium', 'complex'] as const
  const layoutComplexity = complexityValues[(hashValue >> 2) % 3]

  const imageQuality = 60 + (hashValue % 40)

  return {
    medicineCount,
    likelyDiagnosis,
    handwritingQuality,
    layoutComplexity,
    imageQuality,
  }
}

function selectMedicinesForDiagnosis(
  diagnosis: typeof mockDiagnoses[0],
  count: number
): { medicine: MedicineTemplate; confidence: number }[] {
  const availableMedicines = diagnosis.medicines

  const selected: { medicine: MedicineTemplate; confidence: number }[] = []
  const usedNames = new Set<string>()

  for (const medName of availableMedicines) {
    if (selected.length >= count) break

    const match = findBestMedicineMatch(medName)
    if (match && !usedNames.has(match.template.name)) {
      const baseConfidence = 0.85 + Math.random() * 0.12
      usedNames.add(match.template.name)
      selected.push({
        medicine: match.template,
        confidence: Math.min(baseConfidence, 0.99),
      })
    }
  }

  while (selected.length < count) {
    const randomTemplate = medicineTemplates[Math.floor(Math.random() * medicineTemplates.length)]
    if (!usedNames.has(randomTemplate.name)) {
      usedNames.add(randomTemplate.name)
      selected.push({
        medicine: randomTemplate,
        confidence: 0.7 + Math.random() * 0.2,
      })
    }
  }

  return selected
}

function createPrescriptionMedicine(
  template: MedicineTemplate,
  confidence: number
): PrescriptionMedicine & { confidence: number } {
  return {
    medicineId: '',
    name: template.name,
    specification: template.specification,
    dosage: getRandomItem(template.commonDosages),
    frequency: getRandomItem(template.commonFrequencies),
    quantity: template.typicalQuantity,
    days: template.typicalDays,
    notes: '',
    confidence,
  }
}

function validateWithMedicineLibrary(
  recognizedMedicines: PrescriptionMedicine[],
  medicineLibrary: Medicine[]
): (PrescriptionMedicine & { confidence: number; libraryMatch?: Medicine })[] {
  return recognizedMedicines.map((med) => {
    let bestMatch: Medicine | undefined
    let highestSimilarity = 0

    for (const libMed of medicineLibrary) {
      const similarity = stringSimilarity(med.name, libMed.name)
      if (similarity > highestSimilarity && similarity >= 0.6) {
        highestSimilarity = similarity
        bestMatch = libMed
      }
    }

    const baseConfidence = (med as any).confidence || 0.8
    const adjustedConfidence = bestMatch
      ? Math.min(baseConfidence + highestSimilarity * 0.15, 0.99)
      : baseConfidence

    return {
      ...med,
      confidence: adjustedConfidence,
      libraryMatch: bestMatch,
    }
  })
}

function correctMedicineName(name: string): string {
  const match = findBestMedicineMatch(name)
  if (match && match.confidence >= 0.5) {
    return match.template.name
  }
  return name
}

export async function recognizePrescription(
  imageBase64: string,
  options?: {
    medicineLibrary?: Medicine[]
    preferredDiagnosis?: string
  }
): Promise<OCRResult & {
  analysis?: {
    medicineCount: number
    diagnosis: string
    handwritingQuality: string
    imageQuality: number
  }
  recognitionDetails?: Array<{
    name: string
    confidence: number
    libraryMatch?: string
  }>
}> {
  return new Promise((resolve) => {
    const baseDelay = 2500
    const additionalDelay = Math.random() * 1500

    setTimeout(() => {
      const shouldFail = Math.random() < 0.02
      if (shouldFail) {
        resolve({
          success: false,
          message: 'OCR识别失败，可能是图片质量不佳，请重新拍摄清晰的处方图片',
        })
        return
      }

      const analysis = analyzeImageContent(imageBase64)

      let diagnosis = analysis.likelyDiagnosis
      if (options?.preferredDiagnosis) {
        const customDiagnosis = mockDiagnoses.find(
          (d) => d.name.includes(options.preferredDiagnosis!) || options.preferredDiagnosis!.includes(d.name)
        )
        if (customDiagnosis) {
          diagnosis = customDiagnosis
        }
      }

      const selectedMedicines = selectMedicinesForDiagnosis(diagnosis, analysis.medicineCount)

      const prescriptionMedicines = selectedMedicines.map(({ medicine, confidence }) =>
        createPrescriptionMedicine(medicine, confidence)
      )

      let validatedMedicines = prescriptionMedicines
      let recognitionDetails

      if (options?.medicineLibrary && options.medicineLibrary.length > 0) {
        const validated = validateWithMedicineLibrary(prescriptionMedicines, options.medicineLibrary)

        validatedMedicines = validated.map((v) => {
          const result: PrescriptionMedicine & { confidence: number } = {
            medicineId: v.libraryMatch?.id || '',
            name: v.name,
            specification: v.libraryMatch?.specification || v.specification,
            dosage: v.dosage,
            frequency: v.frequency,
            quantity: v.quantity,
            days: v.days,
            notes: v.notes,
            confidence: v.confidence,
          }
          return result
        })

        recognitionDetails = validated.map((v) => ({
          name: v.name,
          confidence: v.confidence,
          libraryMatch: v.libraryMatch ? `${v.libraryMatch.name} (${v.libraryMatch.specification})` : undefined,
        }))
      }

      const issueDate = getRandomDate(-Math.floor(Math.random() * 15) - 1)

      const maxDays = Math.max(...validatedMedicines.map((m) => m.days))
      const baseExpiryDays = maxDays + 7
      const expiryDate = getRandomDate(Math.floor(Math.random() * 30) + baseExpiryDays)

      const patientName = getRandomItem(mockPatientNames)

      const category = getRandomItem(diagnosis.categories)

      const resultData = {
        patientName,
        patientAge: Math.floor(Math.random() * 50) + 20,
        patientGender: Math.random() > 0.5 ? ('male' as const) : ('female' as const),
        diagnosis: diagnosis.name,
        code: generatePrescriptionCode(),
        doctorName: getRandomItem(mockDoctorNames),
        department: getRandomItem(mockDepartments),
        hospitalName: getRandomItem(mockHospitalNames),
        issueDate,
        expiryDate,
        medicines: validatedMedicines.map(({ confidence, ...med }) => ({
          medicineId: med.medicineId,
          name: correctMedicineName(med.name),
          specification: med.specification,
          dosage: med.dosage,
          frequency: med.frequency,
          quantity: med.quantity,
          days: med.days,
          notes: med.notes,
        })),
      }

      const avgConfidence =
        validatedMedicines.reduce((sum, m) => sum + (m as any).confidence, 0) / validatedMedicines.length

      let message = `识别成功，共识别出 ${validatedMedicines.length} 种药品`
      if (avgConfidence >= 0.9) {
        message += '，识别准确率高，请核对信息'
      } else if (avgConfidence >= 0.75) {
        message += '，识别准确率良好，请仔细核对'
      } else {
        message += '，部分药品识别置信度较低，请务必仔细核对'
      }

      if (analysis.handwritingQuality === 'poor') {
        message += '（提示：处方手写字体较潦草，建议仔细核对）'
      }

      resolve({
        success: true,
        data: resultData,
        message,
        analysis: {
          medicineCount: analysis.medicineCount,
          diagnosis: diagnosis.name,
          handwritingQuality: analysis.handwritingQuality,
          imageQuality: analysis.imageQuality,
        },
        recognitionDetails,
      })
    }, baseDelay + additionalDelay)
  })
}

export function getPrescriptionExpiryStatus(expiryDate: string): {
  status: 'active' | 'warning' | 'expired'
  daysLeft: number
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft }
  } else if (daysLeft <= 7) {
    return { status: 'warning', daysLeft }
  } else {
    return { status: 'active', daysLeft }
  }
}

export function formatPrescriptionDaysLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    return `已过期 ${Math.abs(daysLeft)} 天`
  } else if (daysLeft === 0) {
    return '今天到期'
  } else if (daysLeft === 1) {
    return '还剩 1 天'
  } else {
    return `还剩 ${daysLeft} 天`
  }
}

export function getMedicineTemplates() {
  return medicineTemplates
}

export function getDiagnosisOptions() {
  return mockDiagnoses
}

export { stringSimilarity, findBestMedicineMatch, correctMedicineName }
