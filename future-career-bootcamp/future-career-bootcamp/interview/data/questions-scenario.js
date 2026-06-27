// Scenario Interview Question Bank
export const questionsScenario = {
  meta: { type: 'scenario', typeName: '情景面试', description: '假设场景，考察应变能力和决策思维' },
  questions: [
    // === 通用题 ===
    { id: 'scn_001', category: 'self_introduction', categoryName: '自我介绍', difficulty: 1,
      text: '在开始之前，请简单介绍一下你自己和你的职业背景。', scoringCriteria: ['表达能力', '自信度', '专业度'], timeLimit: 180,
      tips: '简洁有力，突出与岗位匹配的核心优势', major: 'general' },
    { id: 'scn_002', category: 'resource_constraint', categoryName: '资源不足', difficulty: 2,
      text: '假设你负责一个重要项目，但预算被削减了30%，人手也减少了。你会怎么应对？', scoringCriteria: ['逻辑思维', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示优先级判断和资源优化能力', major: 'general' },
    { id: 'scn_003', category: 'conflict', categoryName: '冲突处理', difficulty: 3,
      text: '如果你的直属上级要求你做一件你认为不正确的事情，你会怎么办？', scoringCriteria: ['情绪管理', '应变能力', '逻辑思维'], timeLimit: 180,
      tips: '展示职业操守和沟通技巧的平衡', major: 'general' },
    { id: 'scn_004', category: 'team_issue', categoryName: '团队问题', difficulty: 2,
      text: '假设你的团队中有一个成员工作态度消极，影响了整个团队的效率。你会怎么处理？', scoringCriteria: ['应变能力', '表达能力', '逻辑思维'], timeLimit: 180,
      tips: '展示沟通和管理能力，避免极端做法', major: 'general' },
    { id: 'scn_005', category: 'crisis', categoryName: '危机处理', difficulty: 3,
      text: '你正在做一个重要演示，突然系统崩溃了，客户就在面前。你会怎么做？', scoringCriteria: ['应变能力', '情绪管理', '表达能力'], timeLimit: 180,
      tips: '展示临场应变和压力管理能力', major: 'general' },
    { id: 'scn_006', category: 'priority', categoryName: '优先级', difficulty: 2,
      text: '你同时收到三个紧急任务：老板交代的、客户催的、同事求助的。你如何安排？', scoringCriteria: ['逻辑思维', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示判断力和沟通协调能力', major: 'general' },
    { id: 'scn_007', category: 'ethical', categoryName: '职业道德', difficulty: 3,
      text: '如果你发现公司的一个做法可能损害客户利益，但上级让你不要多管，你会怎么做？', scoringCriteria: ['情绪管理', '逻辑思维', '应变能力'], timeLimit: 180,
      tips: '展示职业操守和解决问题的智慧', major: 'general' },
    { id: 'scn_008', category: 'new_role', categoryName: '角色适应', difficulty: 2,
      text: '假设你刚被提升为团队负责人，但团队成员中有你的前同事，有人不服你。你会怎么处理？', scoringCriteria: ['应变能力', '情绪管理', '表达能力'], timeLimit: 180,
      tips: '展示领导力和人际管理能力', major: 'general' },
    { id: 'scn_009', category: 'innovation', categoryName: '创新思维', difficulty: 3,
      text: '公司要求你在一个月内将某个业务指标提升50%，但现有方法已经到了瓶颈。你会怎么做？', scoringCriteria: ['逻辑思维', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示创新思维和可行性分析能力', major: 'general' },
    { id: 'scn_010', category: 'communication', categoryName: '跨部门沟通', difficulty: 2,
      text: '你需要其他部门配合完成一个项目，但对方以各种理由推脱。你会怎么推进？', scoringCriteria: ['表达能力', '应变能力', '逻辑思维'], timeLimit: 180,
      tips: '展示沟通技巧和推动力', major: 'general' },

    // === 会计专业情景题 ===
    { id: 'scn_acc_001', category: 'professional', categoryName: '专业情景', difficulty: 3,
      text: '假设你发现公司财报中有一处数据异常，但财务总监说"这不是大问题"让你别追究。你会怎么做？', scoringCriteria: ['专业度', '情绪管理', '应变能力'], timeLimit: 180,
      tips: '平衡职业操守与上级关系，体现合规意识', major: ['accounting'] },
    // === 法学专业情景题 ===
    { id: 'scn_law_001', category: 'professional', categoryName: '专业情景', difficulty: 3,
      text: '假设你正在为一家公司做法律审查，发现其某个长期合同存在重大法律风险，但公司不想修改。你会怎么处理？', scoringCriteria: ['专业度', '应变能力', '表达能力'], timeLimit: 180,
      tips: '展示风险提示能力与客户沟通技巧', major: ['law'] },
    // === 计算机专业情景题 ===
    { id: 'scn_cs_001', category: 'professional', categoryName: '专业情景', difficulty: 3,
      text: '假设你上线的新功能在发布后2小时就被大量用户投诉，CEO要求你10分钟内解决。你的排查思路是什么？', scoringCriteria: ['专业度', '应变能力', '逻辑思维'], timeLimit: 180,
      tips: '展示应急响应流程和技术决策能力', major: ['cs'] },
    // === 财务管理情景题 ===
    { id: 'scn_fin_001', category: 'professional', categoryName: '专业情景', difficulty: 2,
      text: '假设公司要扩张新业务线，CEO让你做一份投资可行性分析，你会从哪些维度评估？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '从ROI、现金流、风险、市场等维度分析', major: ['finance'] },
    // === 市场营销情景题 ===
    { id: 'scn_mkt_001', category: 'professional', categoryName: '专业情景', difficulty: 2,
      text: '假设公司预算有限，只能选一种渠道做推广，你会怎么选择并说明理由？', scoringCriteria: ['专业度', '逻辑思维', '表达能力'], timeLimit: 180,
      tips: '展示渠道选择逻辑和ROI思维', major: ['marketing'] },
  ],
};
