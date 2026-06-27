// Career Path AI Adapter - 职业路径规划 AI 集成
// 复用讯飞 chatxunfei OpenAI 兼容接口，带 MockAI 降级

import { API_CONFIG } from './config.js';

// === Base class ===
class CareerAIAdapter {
  async generateCareerPlan(context) { throw new Error('Must be implemented'); }
}

// === Mock implementation（本地规则降级） ===
class MockCareerAdapter extends CareerAIAdapter {
  async generateCareerPlan(context) {
    await this._delay(800, 1500);
    const { basicInfo, careerIntent, skills, preferences, extra } = context;

    const name = basicInfo.name || '同学';
    const major = basicInfo.major || '综合';
    const industries = careerIntent.industries || [];
    const roles = careerIntent.roles || [];
    const goal = careerIntent.goal || '';
    const city = (preferences.cities || [])[0] || '一线';

    // 基于专业和意向的简单匹配
    const pathMap = {
      '会计': { path: '财务分析 → 财务经理 → CFO', desc: '从基础会计核算出发，逐步深入财务分析与管理决策' },
      '金融': { path: '分析师 → 投资经理 → 基金总监', desc: '金融行业从执行到决策的典型晋升路径' },
      '法学': { path: '法务专员 → 法务主管 → 法务总监', desc: '从企业法务合规切入，积累经验后走向管理层' },
      '计算机': { path: '开发工程师 → 技术负责人 → CTO', desc: '技术路线从编码到架构再到技术管理' },
      '管理': { path: '管理培训生 → 部门经理 → 业务负责人', desc: '管理条线从轮岗起步，全面成长后独当一面' },
      '市场营销': { path: '市场专员 → 品牌经理 → 市场总监', desc: '从执行到策略再到品牌战略的进阶之路' },
    };

    const matched = pathMap[major] || { path: '专员 → 主管 → 经理 → 总监', desc: '稳步积累专业能力，逐步走向管理岗位' };

    return {
      careerPath: matched.path,
      pathDescription: `${name}，基于你的${major}专业背景${industries.length ? '和对' + industries.join('、') + '行业的兴趣' : ''}，推荐这条发展路径。${matched.desc}。${goal ? '你的目标"' + goal + '"与这条路径高度契合。' : ''}`,
      milestones: [
        { stage: '起步期', timeframe: '毕业1-2年', goals: '建立专业基础，熟悉行业规则', actions: '选择与专业匹配的入门岗位，考取基础职业资格证书，主动承担项目积累实战经验' },
        { stage: '成长期', timeframe: '3-5年', goals: '深化专业能力，拓展行业人脉', actions: '在核心业务线深耕，争取跨部门协作机会，参加行业交流活动，建立个人专业品牌' },
        { stage: '突破期', timeframe: '5-8年', goals: '从执行者转型为决策者', actions: '主动争取管理职责，培养团队领导力，关注行业趋势与商业模式创新' },
        { stage: '成熟期', timeframe: '8年以上', goals: '成为行业专家或管理者', actions: '在专业领域建立深度影响力，培养接班人，参与行业标准和方向制定' },
      ],
      skillGaps: ['行业深度认知', '跨部门沟通能力', '数据分析与决策', '商业思维培养'],
      strengths: skills.strengths && skills.strengths.length ? skills.strengths : ['学习能力强', '专业基础扎实'],
      suggestions: [
        '尽早确定细分方向，集中精力深耕而非广撒网',
        `${city}的${industries[0] || '目标'}行业机会多，建议在校期间就开始实习积累`,
        '建立个人知识管理体系，持续输出专业内容提升影响力',
        '寻找行业导师，定期获取职业发展建议和反馈',
      ],
      resources: [
        '职场特训营课程：简历表达、面试技巧、职业规划',
        '行业报告：关注目标行业年度趋势报告',
        '专业社区：加入相关行业社群，保持信息敏感度',
      ],
      risks: [
        '过早局限在单一赛道可能错失跨界机会',
        '仅凭兴趣选择行业，需兼顾市场需求与自身优势',
      ],
    };
  }

  _delay(min, max) {
    return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
  }
}

// === 讯飞 AI 适配器 ===
class XunfeiCareerAdapter extends CareerAIAdapter {
  constructor() {
    super();
    this.apiKey = API_CONFIG.xunfei.apiKey;
    this.apiSecret = API_CONFIG.xunfei.apiSecret;
    this.baseUrl = API_CONFIG.xunfei.baseUrl;
    this.model = API_CONFIG.xunfei.model;
    this.mockFallback = new MockCareerAdapter();
  }

  async _callAPI(messages, maxTokens = 800) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content ? content.trim() : null;
    } catch (err) {
      console.warn(`Career AI call failed: ${err.message}`);
      return null;
    }
  }

  async generateCareerPlan(context) {
    const { basicInfo, careerIntent, skills, preferences, extra } = context;

    const systemPrompt = `你是一位资深职业发展顾问，专长是为大学生和应届毕业生规划职业发展路径。你需要根据用户提供的个人信息，给出详细、可执行的职业路径规划。

你的输出必须是合法 JSON，不要加任何 markdown 标记或代码块标记，直接输出 JSON 文本。

JSON 结构如下：
{
  "careerPath": "推荐路径的简短描述，如：数据分析师 → 高级分析师 → 数据总监",
  "pathDescription": "路径详细描述，2-3句话说明为什么推荐这条路径",
  "milestones": [
    {"stage": "阶段名称", "timeframe": "时间范围", "goals": "这个阶段的核心目标", "actions": "2-3条具体行动建议"}
  ],
  "skillGaps": ["需要补充的技能1", "技能2", "技能3"],
  "strengths": ["用户已有优势1", "优势2"],
  "suggestions": ["建议1", "建议2", "建议3", "建议4"],
  "resources": ["推荐资源1", "资源2", "资源3"],
  "risks": ["潜在风险1", "风险2"]
}

关键规则：
1. milestones 至少3个阶段，至多5个
2. skillGaps 3-5条，要有针对性
3. suggestions 4-5条，要具体可操作
4. resources 3-4条，要实用
5. risks 2-3条，要客观
6. 基于用户的专业、意向和能力给出个性化建议，不要泛泛而谈
7. 只输出 JSON，不要加任何其他文字`;

    const userPrompt = `请为以下用户规划职业发展路径：

【基本信息】
姓名：${basicInfo.name || '未填写'}
年级：${basicInfo.grade || '未填写'}
专业：${basicInfo.major || '未填写'}

【职业意向】
感兴趣的行业：${(careerIntent.industries || []).join('、') || '未填写'}
期望岗位方向：${(careerIntent.roles || []).join('、') || '未填写'}
长期职业目标：${careerIntent.goal || '未填写'}

【能力评估】
已有技能/证书：${(skills.existing || []).join('、') || '未填写'}
核心优势：${(skills.strengths || []).join('、') || '未填写'}
待提升领域：${(skills.gaps || []).join('、') || '未填写'}

【工作偏好】
期望城市：${(preferences.cities || []).join('、') || '未填写'}
工作强度偏好：${preferences.workload || '未填写'}
薪资预期：${preferences.salary || '未填写'}

【补充信息】
${extra || '无'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await this._callAPI(messages, 800);

    if (result) {
      try {
        // 尝试提取 JSON（AI 可能在前后加了多余文字）
        let jsonStr = result;
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        // 验证必要字段
        if (parsed.careerPath && parsed.milestones) return parsed;
      } catch (e) {
        console.warn('Career AI JSON parse failed, falling back to mock', e);
      }
    }

    return this.mockFallback.generateCareerPlan(context);
  }
}

// === Factory ===
export function createCareerAdapter(type = 'xunfei') {
  switch (type) {
    case 'xunfei':
      return new XunfeiCareerAdapter();
    case 'mock':
    default:
      return new MockCareerAdapter();
  }
}
