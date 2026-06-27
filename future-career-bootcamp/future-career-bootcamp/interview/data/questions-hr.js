// HR Interview Question Bank
export const questionsHR = {
  meta: {
    type: 'hr',
    typeName: 'HR面试',
    description: '考察综合素质、沟通能力、职业素养',
  },
  questions: [
    // === 通用题 ===
    { id: 'hr_001', category: 'self_introduction', categoryName: '自我介绍', difficulty: 1,
      text: '请简单介绍一下你自己。', scoringCriteria: ['表达能力', '自信度', '专业度'], timeLimit: 180,
      tips: '建议用1-2分钟，涵盖教育背景、工作经历、核心优势', major: 'general' },
    { id: 'hr_002', category: 'strength_weakness', categoryName: '优缺点', difficulty: 2,
      text: '说说你最大的缺点是什么？你是如何克服的？', scoringCriteria: ['表达能力', '自信度', '情绪管理'], timeLimit: 180,
      tips: '避免说"太追求完美"等假缺点，选择真实但非致命的缺点', major: 'general' },
    { id: 'hr_003', category: 'career_plan', categoryName: '职业规划', difficulty: 2,
      text: '你对未来3-5年的职业发展有什么规划？', scoringCriteria: ['逻辑思维', '自信度', '专业度'], timeLimit: 180,
      tips: '展示清晰的职业路径，与应聘岗位关联', major: 'general' },
    { id: 'hr_004', category: 'job_change', categoryName: '离职原因', difficulty: 2,
      text: '你为什么离开上一家公司？', scoringCriteria: ['表达能力', '情绪管理', '应变能力'], timeLimit: 150,
      tips: '避免负面评价前公司，聚焦于自身发展需求', major: 'general' },
    { id: 'hr_005', category: 'achievement', categoryName: '工作成就', difficulty: 1,
      text: '请分享一个你最自豪的工作成就。', scoringCriteria: ['表达能力', '自信度', '专业度'], timeLimit: 180,
      tips: '用STAR法则描述，突出个人贡献和量化结果', major: 'general' },
    { id: 'hr_006', category: 'teamwork', categoryName: '团队协作', difficulty: 2,
      text: '描述一次你在团队中发挥重要作用的经历。', scoringCriteria: ['表达能力', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '强调协作过程和团队成果，而非个人英雄主义', major: 'general' },
    { id: 'hr_007', category: 'conflict', categoryName: '冲突处理', difficulty: 3,
      text: '当你和同事或上级意见不一致时，你会怎么处理？', scoringCriteria: ['情绪管理', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示沟通和协调能力，避免偏激或消极态度', major: 'general' },
    { id: 'hr_008', category: 'pressure', categoryName: '压力应对', difficulty: 3,
      text: '描述一个你在巨大压力下完成任务的例子。', scoringCriteria: ['情绪管理', '应变能力', '逻辑思维'], timeLimit: 180,
      tips: '展示抗压能力和时间管理技巧', major: 'general' },
    { id: 'hr_009', category: 'motivation', categoryName: '求职动机', difficulty: 1,
      text: '你为什么想加入我们公司？', scoringCriteria: ['表达能力', '专业度', '自信度'], timeLimit: 150,
      tips: '展示对公司的研究和了解，与自身发展结合', major: 'general' },
    { id: 'hr_010', category: 'value', categoryName: '个人价值', difficulty: 2,
      text: '你觉得你能为公司带来什么价值？', scoringCriteria: ['自信度', '专业度', '逻辑思维'], timeLimit: 180,
      tips: '结合岗位要求，用具体能力匹配公司需求', major: 'general' },

    // === 会计学专业题 ===
    { id: 'hr_acc_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '作为一名会计人员，你认为会计工作中最重要的职业素养是什么？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '从诚信、严谨、合规等角度展开', major: ['accounting', 'finance'] },
    { id: 'hr_acc_002', category: 'professional', categoryName: '专业实践', difficulty: 3,
      text: '如果在审核中发现一笔账目存在疑问，但上级让你直接通过，你会怎么处理？', scoringCriteria: ['情绪管理', '专业度', '应变能力'], timeLimit: 180,
      tips: '平衡合规性与职场关系，体现职业操守', major: ['accounting'] },
    { id: 'hr_acc_003', category: 'career_plan', categoryName: '职业规划', difficulty: 2,
      text: '你对注册会计师考试有什么规划？如何看待持续学习在会计行业的重要性？', scoringCriteria: ['专业度', '逻辑思维', '自信度'], timeLimit: 180,
      tips: '展示清晰的考证规划和学习态度', major: ['accounting'] },

    // === 财务管理专业题 ===
    { id: 'hr_fin_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '你认为一名优秀的财务管理者应该具备哪些核心能力？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '从分析能力、风险意识、战略思维等维度回答', major: ['finance'] },
    { id: 'hr_fin_002', category: 'professional', categoryName: '专业实践', difficulty: 3,
      text: '如果公司面临现金流紧张的情况，作为财务管理者你会提出哪些建议？', scoringCriteria: ['专业度', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '从成本控制、融资渠道、应收账款管理等角度分析', major: ['finance', 'management'] },

    // === 法学专业题 ===
    { id: 'hr_law_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '你认为法律工作者最重要的职业品质是什么？如何在实际工作中坚持？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '从公正、严谨、职业操守等角度阐述', major: ['law'] },
    { id: 'hr_law_002', category: 'professional', categoryName: '专业实践', difficulty: 3,
      text: '如果客户要求你做一件在法律边缘的事，你会如何应对？', scoringCriteria: ['情绪管理', '专业度', '应变能力'], timeLimit: 180,
      tips: '体现法律底线意识，同时展示沟通技巧', major: ['law'] },

    // === 计算机科学专业题 ===
    { id: 'hr_cs_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '作为技术岗位候选人，你如何看待技术更新迭代快带来的挑战？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '展示持续学习能力和技术视野', major: ['cs'] },
    { id: 'hr_cs_002', category: 'professional', categoryName: '专业实践', difficulty: 3,
      text: '如果你的技术方案被团队否决，但你觉得它是最优解，你会怎么办？', scoringCriteria: ['情绪管理', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示技术说服力和团队协作意识', major: ['cs'] },

    // === 工商管理专业题 ===
    { id: 'hr_mgt_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '你认为管理者最核心的能力是什么？请结合你的理解举例说明。', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '从决策、沟通、激励等管理核心能力展开', major: ['management'] },

    // === 市场营销专业题 ===
    { id: 'hr_mkt_001', category: 'professional', categoryName: '专业认知', difficulty: 2,
      text: '你如何看待数据驱动与创意在市场营销中的关系？', scoringCriteria: ['专业度', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '展示对现代营销的全面理解', major: ['marketing'] },
    { id: 'hr_mkt_002', category: 'professional', categoryName: '专业实践', difficulty: 3,
      text: '如果一次营销活动的效果远低于预期，你会如何复盘和调整？', scoringCriteria: ['专业度', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '从数据分析、问题定位、策略调整等步骤展开', major: ['marketing'] },
  ],
};
