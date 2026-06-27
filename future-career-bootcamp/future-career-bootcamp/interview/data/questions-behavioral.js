// Behavioral Interview Question Bank
export const questionsBehavioral = {
  meta: { type: 'behavioral', typeName: '行为面试', description: '基于STAR法则，考察过往行为预测未来表现' },
  questions: [
    // === 通用题 ===
    { id: 'beh_001', category: 'self_introduction', categoryName: '自我介绍', difficulty: 1,
      text: '请用2分钟时间介绍你自己，重点讲讲你的职业经历。', scoringCriteria: ['表达能力', '自信度', '专业度'], timeLimit: 180,
      tips: '聚焦与岗位相关的经历，用数据和成果说话', major: 'general' },
    { id: 'beh_002', category: 'challenge', categoryName: '挑战应对', difficulty: 2,
      text: '请描述一个你在工作中遇到的最大挑战，你是如何应对的？', scoringCriteria: ['逻辑思维', '应变能力', '表达能力'], timeLimit: 180,
      tips: '用STAR法则完整描述，突出解决问题的思路', major: 'general' },
    { id: 'beh_003', category: 'teamwork', categoryName: '团队协作', difficulty: 2,
      text: '讲一个你和团队成员合作完成重要项目的经历。你在其中扮演了什么角色？', scoringCriteria: ['表达能力', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '明确个人贡献，展示协作和沟通能力', major: 'general' },
    { id: 'beh_004', category: 'conflict', categoryName: '冲突处理', difficulty: 3,
      text: '描述一次你和同事产生严重分歧的经历。你是如何解决的？', scoringCriteria: ['情绪管理', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示理性沟通和求同存异的能力', major: 'general' },
    { id: 'beh_005', category: 'leadership', categoryName: '领导力', difficulty: 3,
      text: '请举一个你主动承担责任、推动项目前进的例子。', scoringCriteria: ['逻辑思维', '自信度', '表达能力'], timeLimit: 180,
      tips: '突出主动性和影响力，而非职权', major: 'general' },
    { id: 'beh_006', category: 'failure', categoryName: '失败经历', difficulty: 2,
      text: '讲一个你做决策失误的经历。事后你是怎么处理的？', scoringCriteria: ['情绪管理', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '坦诚面对失败，重点在反思和改进', major: 'general' },
    { id: 'beh_007', category: 'communication', categoryName: '沟通能力', difficulty: 2,
      text: '讲一个你需要说服他人接受你观点的经历。你是怎么做的？', scoringCriteria: ['表达能力', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '展示逻辑说服和换位思考的能力', major: 'general' },
    { id: 'beh_008', category: 'time_management', categoryName: '时间管理', difficulty: 2,
      text: '描述一个你同时处理多个紧急任务的经历。你是如何安排优先级的？', scoringCriteria: ['逻辑思维', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示优先级判断和时间分配能力', major: 'general' },
    { id: 'beh_009', category: 'growth', categoryName: '个人成长', difficulty: 1,
      text: '分享一个你从工作中学到重要一课的经历。', scoringCriteria: ['表达能力', '逻辑思维', '自信度'], timeLimit: 180,
      tips: '展示反思能力和持续学习的态度', major: 'general' },
    { id: 'beh_010', category: 'adaptability', categoryName: '适应变化', difficulty: 3,
      text: '描述一个你需要快速适应重大变化的经历。你是怎么应对的？', scoringCriteria: ['应变能力', '情绪管理', '逻辑思维'], timeLimit: 180,
      tips: '展示灵活性和积极应对变化的态度', major: 'general' },

    // === 会计专业行为题 ===
    { id: 'beh_acc_001', category: 'professional', categoryName: '专业实践', difficulty: 2,
      text: '请描述一次你在月结或年结过程中发现重大差异的经历，你是如何排查和解决的？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '展示排查思路和专业判断能力', major: ['accounting'] },
    // === 法学专业行为题 ===
    { id: 'beh_law_001', category: 'professional', categoryName: '专业实践', difficulty: 2,
      text: '请描述一次你在法律意见书中发现团队疏漏的经历，你是如何处理的？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '展示严谨的职业态度和沟通能力', major: ['law'] },
    // === 计算机专业行为题 ===
    { id: 'beh_cs_001', category: 'professional', categoryName: '专业实践', difficulty: 2,
      text: '请描述一次你负责解决线上紧急故障的经历。你是如何定位和修复的？', scoringCriteria: ['专业度', '应变能力', '逻辑思维'], timeLimit: 180,
      tips: '展示技术排障能力和应急响应流程', major: ['cs'] },
    // === 财务管理专业行为题 ===
    { id: 'beh_fin_001', category: 'professional', categoryName: '专业实践', difficulty: 2,
      text: '请描述一次你通过财务分析发现经营风险并提出改进建议的经历。', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '展示数据分析能力和商业洞察力', major: ['finance'] },
    // === 市场营销专业行为题 ===
    { id: 'beh_mkt_001', category: 'professional', categoryName: '专业实践', difficulty: 2,
      text: '请描述一次你策划并执行的营销活动，效果如何？你从中学到了什么？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '展示策划能力和数据驱动的复盘思维', major: ['marketing'] },
  ],
};
