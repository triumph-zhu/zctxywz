// Response Analyzer - preset rules for analyzing user responses
// [AI-INTEGRATION-POINT] This module can be replaced with AI-powered analysis

export class ResponseAnalyzer {
  analyze(response, question) {
    return {
      length: response.length,
      hasStructure: this.detectStructure(response),
      hasSTAR: this.detectSTAR(response),
      hasExample: this.detectExample(response),
      hasData: this.detectData(response),
      keywords: this.extractKeywords(response, question),
      claims: this.extractClaims(response),
      fillerCount: this.countFillerWords(response),
      quality: this.assessQuality(response, question),
    };
  }

  detectStructure(text) {
    const markers = [
      /首先|其次|再次|最后/,
      /第一|第二|第三/,
      /一方面|另一方面/,
      /一是|二是|三是/,
      /1[.、]|2[.、]|3[.、]/,
      /其一|其二|其三/,
      /开头|然后|接着|最后/,
    ];
    return markers.some(regex => regex.test(text));
  }

  detectSTAR(text) {
    const s = /当时|那时候|情境|背景|情况|之前|曾经/;
    const t = /任务|目标|需要|要求|负责|挑战/;
    const a = /我做了|采取了|行动|方案|步骤|实施|推进/;
    const r = /结果|成果|效果|达成|提升|降低|增加|完成|实现/;
    return {
      situation: s.test(text),
      task: t.test(text),
      action: a.test(text),
      result: r.test(text),
      completeness: [s.test(text), t.test(text), a.test(text), r.test(text)].filter(Boolean).length,
    };
  }

  detectExample(text) {
    const patterns = [
      /比如|例如|举个例子|比如说/,
      /有一次|曾经|之前在/,
      /在我.*的时候|在我.*的经历/,
      /具体来说|具体地/,
    ];
    return patterns.some(regex => regex.test(text));
  }

  detectData(text) {
    return /\d+%|\d+人|\d+万|\d+个|\d+倍|\d+元|\d+天|\d+月|\d+年/.test(text);
  }

  extractKeywords(response, question) {
    // Simple keyword extraction based on question category
    const categoryKeywords = {
      self_introduction: ['经验', '专业', '能力', '优势', '背景'],
      strength_weakness: ['优点', '缺点', '改进', '克服', '提升'],
      career_plan: ['规划', '目标', '发展', '方向', '成长'],
      challenge: ['挑战', '困难', '解决', '克服', '应对'],
      teamwork: ['团队', '协作', '沟通', '配合', '合作'],
      conflict: ['冲突', '分歧', '处理', '协调', '解决'],
      leadership: ['领导', '带领', '管理', '推动', '组织'],
      failure: ['失败', '教训', '反思', '改进', '总结'],
    };
    const cat = question?.category || '';
    const keywords = categoryKeywords[cat] || [];
    return keywords.filter(kw => response.includes(kw));
  }

  extractClaims(text) {
    // Extract statements that can be followed up on
    const claimPatterns = [
      /我带领[^，。]+/,
      /我负责[^，。]+/,
      /我完成了[^，。]+/,
      /我提升了[^，。]+/,
      /我解决了[^，。]+/,
      /我推动了[^，。]+/,
      /我管理[^，。]+/,
      /我开发了[^，。]+/,
    ];
    const claims = [];
    for (const pattern of claimPatterns) {
      const match = text.match(pattern);
      if (match) claims.push(match[0]);
    }
    return claims;
  }

  countFillerWords(text) {
    const fillers = ['嗯', '那个', '就是', '然后呢', '怎么说呢', '反正', '其实吧', '对吧', '你知道吗'];
    let count = 0;
    for (const filler of fillers) {
      const regex = new RegExp(filler, 'g');
      const matches = text.match(regex);
      if (matches) count += matches.length;
    }
    return count;
  }

  assessQuality(response, question) {
    let score = 50;

    // Length assessment
    if (response.length < 20) score -= 20;
    else if (response.length < 50) score -= 10;
    else if (response.length >= 100 && response.length <= 500) score += 5;
    else if (response.length > 500) score += 2;

    // Structure bonus
    if (this.detectStructure(response)) score += 10;

    // STAR bonus
    const star = this.detectSTAR(response);
    score += star.completeness * 3;

    // Example bonus
    if (this.detectExample(response)) score += 8;

    // Data support bonus
    if (this.detectData(response)) score += 5;

    // Filler penalty
    const fillers = this.countFillerWords(response);
    score -= Math.min(fillers * 2, 10);

    return Math.max(0, Math.min(100, score));
  }
}
