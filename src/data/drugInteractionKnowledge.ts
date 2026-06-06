import type { DrugInteraction } from '@/types/medicine'

export const drugInteractionKnowledgeBase: DrugInteraction[] = [
  {
    id: 'inter-001',
    drugAName: '复方氨酚烷胺片',
    drugAAliases: ['氨酚烷胺', '复方氨酚', '感康', '快克'],
    drugBName: '布洛芬缓释胶囊',
    drugBAliases: ['布洛芬', '芬必得', '美林', '恬倩'],
    type: 'drug-drug',
    riskLevel: 'danger',
    mechanism: '复方氨酚烷胺片中含有对乙酰氨基酚，与布洛芬同属非甾体抗炎药（NSAIDs），同时使用会增加肝肾毒性风险，可能导致严重的胃肠道出血、肝肾功能损害。',
    symptoms: ['恶心呕吐', '胃痛', '消化道出血', '肝区疼痛', '肾功能异常', '头晕耳鸣'],
    suggestions: [
      '禁止同时使用这两种药物',
      '如需镇痛退热，请选择其中一种使用',
      '两次用药间隔至少4-6小时',
      '24小时内使用不超过4次',
      '如已同时使用，请立即停药并就医',
    ],
    references: '中国药典2020版临床用药须知',
  },
  {
    id: 'inter-002',
    drugAName: '复方氨酚烷胺片',
    drugAAliases: ['氨酚烷胺', '复方氨酚', '感康', '快克'],
    drugBName: '酒精',
    drugBAliases: ['酒', '白酒', '啤酒', '红酒', '黄酒', '乙醇'],
    type: 'drug-food',
    riskLevel: 'danger',
    mechanism: '复方氨酚烷胺片中的对乙酰氨基酚在体内代谢时会产生有毒代谢产物，酒精会诱导肝酶增强毒性代谢产物的生成，严重时可导致肝坏死。',
    symptoms: ['恶心呕吐', '肝区疼痛', '黄疸', '肝功能异常', '严重肝损伤', '昏迷'],
    suggestions: [
      '用药期间及停药后7天内严禁饮酒',
      '避免食用含酒精的食物和饮料',
      '如不慎饮酒，应立即就医检查肝功能',
      '多喝水促进药物代谢',
    ],
    references: '国家药品不良反应监测中心通报',
  },
  {
    id: 'inter-003',
    drugAName: '阿莫西林胶囊',
    drugAAliases: ['阿莫西林', '阿莫仙', '青霉素类抗生素'],
    drugBName: '蒙脱石散',
    drugBAliases: ['思密达', '蒙脱石'],
    type: 'drug-drug',
    riskLevel: 'caution',
    mechanism: '蒙脱石散具有强大的吸附作用，可在胃肠道表面形成保护膜，同时会吸附阿莫西林，降低其在胃肠道的吸收，影响抗菌效果。',
    symptoms: ['抗生素疗效降低', '感染控制不佳', '病情反复'],
    suggestions: [
      '两药应间隔2小时以上服用',
      '先服用阿莫西林，2小时后再服用蒙脱石散',
      '蒙脱石散治疗急性腹泻首次剂量可加倍',
      '如感染症状加重，请及时就医',
    ],
    references: '马丁代尔药物大典',
  },
  {
    id: 'inter-004',
    drugAName: '阿莫西林胶囊',
    drugAAliases: ['阿莫西林', '阿莫仙', '青霉素类抗生素'],
    drugBName: '酒精',
    drugBAliases: ['酒', '白酒', '啤酒', '红酒', '黄酒', '乙醇'],
    type: 'drug-food',
    riskLevel: 'caution',
    mechanism: '虽然阿莫西林不像头孢类抗生素那样会引起典型的双硫仑样反应，但酒精仍可能加重肝脏负担，影响药物代谢，增加胃肠道刺激。',
    symptoms: ['恶心呕吐', '胃部不适', '头晕', '肝功能异常'],
    suggestions: [
      '用药期间建议避免饮酒',
      '停药后3天内也应避免饮酒',
      '注意观察是否有不适症状',
      '如有不适及时就医',
    ],
    references: '抗菌药物临床应用指导原则',
  },
  {
    id: 'inter-005',
    drugAName: '布洛芬缓释胶囊',
    drugAAliases: ['布洛芬', '芬必得', '美林', '恬倩'],
    drugBName: '酒精',
    drugBAliases: ['酒', '白酒', '啤酒', '红酒', '黄酒', '乙醇'],
    type: 'drug-food',
    riskLevel: 'danger',
    mechanism: '布洛芬与酒精同时使用会显著增加胃肠道出血和溃疡风险，同时加重肝脏负担，可能导致急性肝肾损伤。',
    symptoms: ['胃痛', '黑便', '呕血', '肝区疼痛', '肾功能异常', '头晕'],
    suggestions: [
      '用药期间及停药后3天内严禁饮酒',
      '避免食用含酒精的食物',
      '有胃溃疡病史者禁用布洛芬',
      '如出现胃痛或黑便应立即停药就医',
    ],
    references: 'FDA药品安全公告',
  },
  {
    id: 'inter-006',
    drugAName: '布洛芬缓释胶囊',
    drugAAliases: ['布洛芬', '芬必得', '美林', '恬倩'],
    drugBName: '硝苯地平缓释片',
    drugBAliases: ['硝苯地平', '拜新同', '心痛定', '伲福达'],
    type: 'drug-drug',
    riskLevel: 'caution',
    mechanism: '布洛芬可能降低硝苯地平的降压效果，同时两药合用会增加肾脏损害和胃肠道出血的风险。',
    symptoms: ['血压升高', '头痛', '水肿', '胃痛', '肾功能异常'],
    suggestions: [
      '如需同时使用，应密切监测血压',
      '监测肾功能变化',
      '可考虑使用对乙酰氨基酚替代布洛芬',
      '建议饭后服用减少胃肠道刺激',
    ],
    references: '抗高血压药物临床应用指南',
  },
  {
    id: 'inter-007',
    drugAName: '氯雷他定片',
    drugAAliases: ['氯雷他定', '开瑞坦', '息斯敏'],
    drugBName: '酒精',
    drugBAliases: ['酒', '白酒', '啤酒', '红酒', '黄酒', '乙醇'],
    type: 'drug-food',
    riskLevel: 'caution',
    mechanism: '虽然氯雷他定的镇静作用较弱，但与酒精合用时仍可能加重嗜睡、头晕等中枢抑制作用，影响注意力和反应能力。',
    symptoms: ['嗜睡', '头晕', '注意力不集中', '反应迟钝', '乏力'],
    suggestions: [
      '用药期间避免饮酒',
      '避免驾驶或操作危险机械',
      '如出现严重嗜睡应停药并咨询医生',
      '老年人应特别注意',
    ],
    references: '抗组胺药物临床应用专家共识',
  },
  {
    id: 'inter-008',
    drugAName: '硝苯地平缓释片',
    drugAAliases: ['硝苯地平', '拜新同', '心痛定', '伲福达'],
    drugBName: '西柚汁',
    drugBAliases: ['葡萄柚汁', '西柚', '葡萄柚'],
    type: 'drug-food',
    riskLevel: 'danger',
    mechanism: '西柚汁中的柚皮苷会抑制肠道CYP3A4酶，显著增加硝苯地平的生物利用度，导致血药浓度升高，可能引起严重低血压。',
    symptoms: ['头晕', '头痛', '面部潮红', '心悸', '血压骤降', '晕厥'],
    suggestions: [
      '服用硝苯地平期间严禁饮用西柚汁',
      '避免食用西柚及相关制品',
      '可选择其他柑橘类水果（如橙子、橘子）',
      '如出现低血压症状应立即平卧并就医',
    ],
    references: '加拿大医学会药物相互作用指南',
  },
  {
    id: 'inter-009',
    drugAName: '维生素C片',
    drugAAliases: ['维生素C', '维C', 'Vitamin C', '抗坏血酸'],
    drugBName: '虾',
    drugBAliases: ['小龙虾', '海虾', '河虾', '大虾'],
    type: 'drug-food',
    riskLevel: 'caution',
    mechanism: '理论上大量维生素C可能将虾中的五价砷还原为有毒的三价砷（砒霜），但日常饮食中维生素C和虾的摄入量通常不足以产生毒性反应。',
    symptoms: ['理论上可能出现：恶心呕吐', '腹痛腹泻', '头晕', '中毒症状（实际罕见）'],
    suggestions: [
      '避免同时大量服用维生素C和大量食用虾',
      '正常饮食量无需过度担心',
      '维生素C每日推荐摄入量为100mg',
      '如出现不适症状及时就医',
    ],
    references: '中国居民膳食营养素参考摄入量',
  },
  {
    id: 'inter-010',
    drugAName: '健胃消食片',
    drugAAliases: ['健胃消食'],
    drugBName: '蒙脱石散',
    drugBAliases: ['思密达', '蒙脱石'],
    type: 'drug-herb',
    riskLevel: 'caution',
    mechanism: '蒙脱石散会吸附健胃消食片中的中药成分，降低其消化酶和药效成分的释放和吸收，影响健胃消食效果。',
    symptoms: ['消化不良症状改善不明显', '食欲改善不佳'],
    suggestions: [
      '两药应间隔1-2小时服用',
      '先服用蒙脱石散，1-2小时后服用健胃消食片',
      '饮食宜清淡，忌辛辣油腻',
      '如症状持续3天应就医',
    ],
    references: '中成药临床应用指南',
  },
  {
    id: 'inter-011',
    drugAName: '阿莫西林胶囊',
    drugAAliases: ['阿莫西林', '阿莫仙', '青霉素类抗生素'],
    drugBName: '氯雷他定片',
    drugBAliases: ['氯雷他定', '开瑞坦', '息斯敏'],
    type: 'drug-drug',
    riskLevel: 'safe',
    mechanism: '阿莫西林与氯雷他定之间没有已知的药物相互作用，两药合用不会影响彼此的疗效和安全性。',
    symptoms: [],
    suggestions: [
      '两药可安全合用',
      '按医嘱或说明书规定剂量服用',
      '阿莫西林需按疗程服用，不可随意停药',
    ],
    references: 'Micromedex药物相互作用数据库',
  },
  {
    id: 'inter-012',
    drugAName: '复方氨酚烷胺片',
    drugAAliases: ['氨酚烷胺', '复方氨酚', '感康', '快克'],
    drugBName: '氯雷他定片',
    drugBAliases: ['氯雷他定', '开瑞坦', '息斯敏'],
    type: 'drug-drug',
    riskLevel: 'caution',
    mechanism: '复方氨酚烷胺片中的马来酸氯苯那敏与氯雷他定同属抗组胺药，合用会增加嗜睡、口干等抗胆碱能副作用。',
    symptoms: ['嗜睡', '口干', '视力模糊', '排尿困难', '头晕'],
    suggestions: [
      '尽量避免两药同时使用',
      '如需合用应减少剂量并密切观察',
      '避免驾驶或操作机械',
      '老年人和前列腺肥大患者慎用',
    ],
    references: '抗组胺药物合理使用专家共识',
  },
  {
    id: 'inter-013',
    drugAName: '硝苯地平缓释片',
    drugAAliases: ['硝苯地平', '拜新同', '心痛定', '伲福达'],
    drugBName: '酒精',
    drugBAliases: ['酒', '白酒', '啤酒', '红酒', '黄酒', '乙醇'],
    type: 'drug-food',
    riskLevel: 'danger',
    mechanism: '酒精会扩张血管，与硝苯地平的降压作用叠加，可能导致严重低血压，增加跌倒和心脑血管事件风险。',
    symptoms: ['头晕', '头痛', '心悸', '血压骤降', '晕厥', '甚至休克'],
    suggestions: [
      '服用降压药期间严禁饮酒',
      '定期监测血压',
      '如出现头晕应立即平卧',
      '饮酒后不可服用降压药',
    ],
    references: '中国高血压防治指南',
  },
  {
    id: 'inter-014',
    drugAName: '蒙脱石散',
    drugAAliases: ['思密达', '蒙脱石'],
    drugBName: '其他药物',
    drugBAliases: ['任何其他口服药物'],
    type: 'drug-drug',
    riskLevel: 'caution',
    mechanism: '蒙脱石散具有强大的吸附作用，会显著降低其他口服药物的吸收，影响其疗效。',
    symptoms: ['合用药物疗效降低', '病情控制不佳'],
    suggestions: [
      '蒙脱石散应与其他药物间隔1-2小时服用',
      '建议先服用其他药物，1-2小时后再服用蒙脱石散',
      '蒙脱石散不宜长期大量使用',
      '腹泻控制后应及时停药',
    ],
    references: '腹泻病诊疗规范',
  },
  {
    id: 'inter-015',
    drugAName: '维生素C片',
    drugAAliases: ['维生素C', '维C', 'Vitamin C', '抗坏血酸'],
    drugBName: '阿莫西林胶囊',
    drugBAliases: ['阿莫西林', '阿莫仙', '青霉素类抗生素'],
    type: 'drug-drug',
    riskLevel: 'safe',
    mechanism: '维生素C可酸化尿液，有助于提高阿莫西林在尿液中的浓度，增强其对泌尿系统感染的疗效。',
    symptoms: [],
    suggestions: [
      '两药可安全合用',
      '维生素C有助于增强免疫力',
      '按推荐剂量使用',
      '肾功能不全者需调整维生素C剂量',
    ],
    references: '尿路感染诊断与治疗指南',
  },
  {
    id: 'inter-016',
    drugAName: '健胃消食片',
    drugAAliases: ['健胃消食'],
    drugBName: '阿莫西林胶囊',
    drugBAliases: ['阿莫西林', '阿莫仙', '青霉素类抗生素'],
    type: 'drug-herb',
    riskLevel: 'safe',
    mechanism: '健胃消食片主要成分为太子参、陈皮、山药、麦芽（炒）、山楂，与阿莫西林无明显药代动力学相互作用。',
    symptoms: [],
    suggestions: [
      '两药可安全合用',
      '建议间隔30分钟服用',
      '服药期间饮食宜清淡',
      '忌烟酒及辛辣、生冷、油腻食物',
    ],
    references: '中成药与西药联用指南',
  },
  {
    id: 'inter-017',
    drugAName: '布洛芬缓释胶囊',
    drugAAliases: ['布洛芬', '芬必得', '美林', '恬倩'],
    drugBName: '蒙脱石散',
    drugBAliases: ['思密达', '蒙脱石'],
    type: 'drug-drug',
    riskLevel: 'caution',
    mechanism: '蒙脱石散会吸附布洛芬，降低其吸收速度和程度，可能影响镇痛退热效果。',
    symptoms: ['镇痛效果不佳', '退热效果不明显'],
    suggestions: [
      '先服用布洛芬，2小时后再服用蒙脱石散',
      '如发热不退，可考虑物理降温',
      '多饮水，防止脱水',
      '必要时就医检查',
    ],
    references: '药物相互作用基础与临床',
  },
  {
    id: 'inter-018',
    drugAName: '维生素C片',
    drugAAliases: ['维生素C', '维C', 'Vitamin C', '抗坏血酸'],
    drugBName: '布洛芬缓释胶囊',
    drugBAliases: ['布洛芬', '芬必得', '美林', '恬倩'],
    type: 'drug-drug',
    riskLevel: 'safe',
    mechanism: '维生素C可增强布洛芬的抗炎镇痛效果，同时其抗氧化作用有助于减轻炎症反应，两药合用具有协同作用。',
    symptoms: [],
    suggestions: [
      '两药可安全合用',
      '维生素C有助于提高免疫力',
      '建议饭后服用减少胃肠道刺激',
      '按推荐剂量使用',
    ],
    references: '疼痛药物治疗学',
  },
  {
    id: 'inter-019',
    drugAName: '氯雷他定片',
    drugAAliases: ['氯雷他定', '开瑞坦', '息斯敏'],
    drugBName: '西柚汁',
    drugBAliases: ['葡萄柚汁', '西柚', '葡萄柚'],
    type: 'drug-food',
    riskLevel: 'caution',
    mechanism: '西柚汁会抑制氯雷他定的代谢酶CYP3A4，导致药物在体内蓄积，可能增加副作用风险。',
    symptoms: ['嗜睡', '头痛', '口干', '心律失常（罕见）'],
    suggestions: [
      '服药期间避免饮用西柚汁',
      '可选择其他柑橘类水果',
      '如出现严重副作用及时就医',
      '按推荐剂量服用',
    ],
    references: '食物药物相互作用指南',
  },
  {
    id: 'inter-020',
    drugAName: '健胃消食片',
    drugAAliases: ['健胃消食'],
    drugBName: '浓茶',
    drugBAliases: ['茶', '茶叶', '绿茶', '红茶'],
    type: 'drug-food',
    riskLevel: 'caution',
    mechanism: '浓茶中的鞣酸会与健胃消食片中的生物碱、蛋白质结合形成沉淀物，影响药物吸收和疗效。',
    symptoms: ['消化不良症状改善不明显'],
    suggestions: [
      '服药期间避免饮用浓茶',
      '可饮用淡茶但需与服药间隔1小时以上',
      '饮食宜清淡易消化',
      '忌辛辣油腻食物',
    ],
    references: '中药饮食禁忌指南',
  },
]

export function findDrugInteraction(drugAName: string, drugBName: string): DrugInteraction | null {
  const drugALower = drugAName.toLowerCase().trim()
  const drugBLower = drugBName.toLowerCase().trim()

  return (
    drugInteractionKnowledgeBase.find((interaction) => {
      const aMatch =
        interaction.drugAName.toLowerCase().includes(drugALower) ||
        interaction.drugAAliases.some((alias) => alias.toLowerCase().includes(drugALower))
      const bMatch =
        interaction.drugBName.toLowerCase().includes(drugBLower) ||
        interaction.drugBAliases.some((alias) => alias.toLowerCase().includes(drugBLower))
      if (aMatch && bMatch) return true

      const aMatchReverse =
        interaction.drugBName.toLowerCase().includes(drugALower) ||
        interaction.drugBAliases.some((alias) => alias.toLowerCase().includes(drugALower))
      const bMatchReverse =
        interaction.drugAName.toLowerCase().includes(drugBLower) ||
        interaction.drugAAliases.some((alias) => alias.toLowerCase().includes(drugBLower))
      return aMatchReverse && bMatchReverse
    }) || null
  )
}

export function findInteractionsForDrug(drugName: string): DrugInteraction[] {
  const drugLower = drugName.toLowerCase().trim()
  return drugInteractionKnowledgeBase.filter((interaction) => {
    const aMatch =
      interaction.drugAName.toLowerCase().includes(drugLower) ||
      interaction.drugAAliases.some((alias) => alias.toLowerCase().includes(drugLower))
    const bMatch =
      interaction.drugBName.toLowerCase().includes(drugLower) ||
      interaction.drugBAliases.some((alias) => alias.toLowerCase().includes(drugLower))
    return aMatch || bMatch
  })
}

export const INTERACTION_DISCLAIMER = `
本药品相互作用检测结果仅供参考，不能替代专业医疗建议。
1. 检测结果基于已知的药物相互作用知识库，可能存在未收录的相互作用
2. 个体差异（如肝肾功能、年龄、遗传因素等）可能影响药物相互作用的表现
3. 如您正在服用其他药物或有特殊健康状况，请务必咨询医生或药师
4. 出现任何不适症状，请立即停药并就医
`
