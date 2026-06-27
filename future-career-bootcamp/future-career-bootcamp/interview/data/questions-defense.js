// 论文/项目答辩 Question Bank
export const questionsDefense = {
  meta: {
    type: 'defense',
    typeName: '论文答辩',
    description: '模拟答辩委员会提问，考察选题意义、研究方法、核心论证、质疑应对',
  },
  questions: [
    // === 通用题 - 开场陈述 ===
    { id: 'def_001', category: 'opening', categoryName: '开场陈述', difficulty: 1,
      text: '请简要介绍你的论文（或项目）选题背景和研究意义。', scoringCriteria: ['表达能力', '专业度', '逻辑思维'], timeLimit: 240,
      tips: '从现实需求或学术空白出发，说明选题的价值和必要性', major: 'general' },
    { id: 'def_002', category: 'opening', categoryName: '开场陈述', difficulty: 1,
      text: '请用3分钟时间概述你论文的核心内容和主要结论。', scoringCriteria: ['表达能力', '逻辑思维', '自信度'], timeLimit: 240,
      tips: '先说结论，再展开论证过程，避免陷入细节', major: 'general' },
    { id: 'def_003', category: 'opening', categoryName: '开场陈述', difficulty: 2,
      text: '你的研究试图解决什么核心问题？为什么这个问题值得研究？', scoringCriteria: ['逻辑思维', '专业度', '表达能力'], timeLimit: 180,
      tips: '明确区分研究问题和背景问题，突出问题的独特性', major: 'general' },

    // === 通用题 - 方法论 ===
    { id: 'def_004', category: 'methodology', categoryName: '研究方法', difficulty: 2,
      text: '你为什么选择这种研究方法？有没有考虑过其他方法？', scoringCriteria: ['逻辑思维', '专业度', '应变能力'], timeLimit: 180,
      tips: '说明方法选择的理由，对比其他方法的优劣，体现方法论自觉', major: 'general' },
    { id: 'def_005', category: 'methodology', categoryName: '研究方法', difficulty: 3,
      text: '你的研究方法存在哪些局限性？你是如何弥补的？', scoringCriteria: ['逻辑思维', '专业度', '情绪管理'], timeLimit: 180,
      tips: '坦诚方法局限，但说明采取了哪些措施来降低影响', major: 'general' },
    { id: 'def_006', category: 'methodology', categoryName: '研究方法', difficulty: 2,
      text: '你的数据来源是什么？如何保证数据的可靠性和有效性？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '从数据采集、样本选择、信效度检验等方面回答', major: 'general' },

    // === 通用题 - 核心论证 ===
    { id: 'def_007', category: 'core_content', categoryName: '核心论证', difficulty: 2,
      text: '你研究中最核心的发现是什么？这个发现如何支撑你的结论？', scoringCriteria: ['逻辑思维', '专业度', '表达能力'], timeLimit: 180,
      tips: '用"发现→证据→结论"的逻辑链清晰阐述', major: 'general' },
    { id: 'def_008', category: 'core_content', categoryName: '核心论证', difficulty: 3,
      text: '你的论证过程中有没有遇到与预期不一致的结果？你是如何处理的？', scoringCriteria: ['应变能力', '逻辑思维', '情绪管理'], timeLimit: 180,
      tips: '展示学术诚实，说明如何分析异常结果并调整研究思路', major: 'general' },
    { id: 'def_009', category: 'core_content', categoryName: '核心论证', difficulty: 3,
      text: '你的研究结论有多大的普适性？能否推广到其他场景？', scoringCriteria: ['逻辑思维', '专业度', '应变能力'], timeLimit: 180,
      tips: '客观分析结论的适用边界，既不过度推广也不过度保守', major: 'general' },

    // === 通用题 - 质疑应对 ===
    { id: 'def_010', category: 'challenge', categoryName: '质疑应对', difficulty: 2,
      text: '有学者对你的研究视角提出了不同看法，你认为他们的观点有什么合理之处？', scoringCriteria: ['应变能力', '逻辑思维', '情绪管理'], timeLimit: 180,
      tips: '尊重不同观点，理性分析分歧原因，展现学术包容性', major: 'general' },
    { id: 'def_011', category: 'challenge', categoryName: '质疑应对', difficulty: 3,
      text: '如果让你重新做这个研究，你会做哪些改进？', scoringCriteria: ['逻辑思维', '专业度', '应变能力'], timeLimit: 180,
      tips: '从方法论、数据、理论框架等方面反思，体现学术自省能力', major: 'general' },
    { id: 'def_012', category: 'challenge', categoryName: '质疑应对', difficulty: 3,
      text: '你如何回应"你的样本量不够大"这个质疑？', scoringCriteria: ['应变能力', '专业度', '情绪管理'], timeLimit: 180,
      tips: '用理论依据或数据论证说明样本量的合理性，或承认局限并提出改进方案', major: 'general' },

    // === 通用题 - 总结展望 ===
    { id: 'def_013', category: 'conclusion', categoryName: '总结展望', difficulty: 1,
      text: '你的研究对实践有什么指导意义？', scoringCriteria: ['表达能力', '专业度', '逻辑思维'], timeLimit: 180,
      tips: '从理论贡献和实践应用两个层面回答，给出具体场景', major: 'general' },
    { id: 'def_014', category: 'conclusion', categoryName: '总结展望', difficulty: 2,
      text: '基于你的研究，未来可以朝哪些方向继续深入？', scoringCriteria: ['逻辑思维', '专业度', '表达能力'], timeLimit: 180,
      tips: '提出2-3个可行的研究方向，说明延伸的逻辑和意义', major: 'general' },
    { id: 'def_015', category: 'conclusion', categoryName: '总结展望', difficulty: 2,
      text: '请用一句话总结你论文最核心的贡献。', scoringCriteria: ['表达能力', '自信度', '逻辑思维'], timeLimit: 120,
      tips: '提炼核心创新点，语言精炼有力，直击要害', major: 'general' },

    // === 学术研究类专业题 ===
    { id: 'def_aca_001', category: 'professional', categoryName: '学术深度', difficulty: 2,
      text: '你的研究在理论框架上有什么创新？与现有理论的关系是什么？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '明确理论贡献点（补充、修正、整合），说清与已有理论对话关系', major: ['academic_research'] },
    { id: 'def_aca_002', category: 'professional', categoryName: '学术深度', difficulty: 3,
      text: '你的文献综述是否涵盖了该领域的主要学术争论？你站在哪一方？为什么？', scoringCriteria: ['专业度', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '展示对学术前沿的把握，说明自己的研究如何回应核心争论', major: ['academic_research'] },
    { id: 'def_aca_003', category: 'professional', categoryName: '学术规范', difficulty: 2,
      text: '你的研究如何保证学术规范和伦理要求？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '从研究伦理审查、数据保密、知情同意、学术诚信等方面回答', major: ['academic_research'] },
    { id: 'def_aca_004', category: 'methodology', categoryName: '研究方法', difficulty: 3,
      text: '你的研究采用了什么理论视角？这个视角有什么优势和局限？', scoringCriteria: ['专业度', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '说明理论视角的选择逻辑，客观分析其解释力和盲区', major: ['academic_research'] },

    // === 商业管理类专业题 ===
    { id: 'def_bus_001', category: 'professional', categoryName: '商业洞察', difficulty: 2,
      text: '你的研究结论对企业决策有什么实际指导价值？能举例说明吗？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '用具体商业场景说明应用价值，如战略调整、流程优化、风险控制等', major: ['business_management'] },
    { id: 'def_bus_002', category: 'professional', categoryName: '商业洞察', difficulty: 3,
      text: '你的商业模型在不同行业或市场环境下是否仍然适用？', scoringCriteria: ['逻辑思维', '专业度', '应变能力'], timeLimit: 180,
      tips: '分析模型的适用前提和边界条件，说明需要哪些调整才能迁移', major: ['business_management'] },
    { id: 'def_bus_003', category: 'professional', categoryName: '商业洞察', difficulty: 2,
      text: '你的财务/市场数据分析采用了什么指标？这些指标的选择依据是什么？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '说明指标选取的理论依据和行业标准，体现专业分析能力', major: ['business_management'] },
    { id: 'def_bus_004', category: 'challenge', categoryName: '质疑应对', difficulty: 3,
      text: '如果市场环境发生重大变化，你的研究结论还成立吗？', scoringCriteria: ['应变能力', '逻辑思维', '专业度'], timeLimit: 180,
      tips: '分析结论的鲁棒性，说明哪些条件变化会影响结论，以及应对策略', major: ['business_management'] },
  ],
};
