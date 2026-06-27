// Career Path · Form Page（4步问卷 + 自由补充）
import { $, $$ } from '../utils/dom.js';

// 选项配置数据
const GRADES = ['大一', '大二', '大三', '大四', '研究生', '已毕业'];
const MAJORS = ['会计', '金融', '法学', '计算机', '管理', '市场营销', '学术研究', '工商管理', '其他'];
const INDUSTRIES = ['互联网', '金融', '咨询', '快消', '制造', '教育', '医疗', '政府', '其他'];
const ROLES = ['产品', '运营', '技术', '数据分析', '市场', '人力', '财务', '咨询', '其他'];
const EXISTING_SKILLS = ['Excel', 'PPT', 'Python', 'SQL', 'CPA', 'CFA', '英语六级', '实习经验', '其他'];
const STRENGTHS_LIST = ['沟通表达', '逻辑分析', '团队协作', '创新思维', '执行力', '抗压能力', '其他'];
const GAPS_LIST = ['专业技能', '行业认知', '人脉积累', '英语', '编程', '演讲表达', '其他'];
const CITIES = ['深圳', '广州', '上海', '北京', '杭州', '成都', '其他'];
const WORKLOADS = ['稳定965', '适中', '奋斗型996', '无所谓'];
const SALARIES = ['5K以下', '5-8K', '8-12K', '12-20K', '20K+', '看机会不看钱'];

// 单选组配置
const SINGLE_SELECT_GROUPS = new Set(['cp-grade', 'cp-major', 'cp-workload', 'cp-salary']);
// 多选组 → state路径映射
const MULTI_SELECT_MAP = {
  'cp-industries': 'careerIntent.industries',
  'cp-roles': 'careerIntent.roles',
  'cp-existing': 'skills.existing',
  'cp-strengths': 'skills.strengths',
  'cp-gaps': 'skills.gaps',
  'cp-cities': 'preferences.cities',
};
// 单选组 → state路径映射
const SINGLE_SELECT_MAP = {
  'cp-grade': 'basicInfo.grade',
  'cp-major': 'basicInfo.major',
  'cp-workload': 'preferences.workload',
  'cp-salary': 'preferences.salary',
};

export class FormPage {
  constructor(state, router) {
    this.state = state;
    this.router = router;
    this.container = null;
    this.aiAdapter = null;
    this._boundClick = null;
    this._boundInput = null;
  }

  mount() {
    this.container = document.getElementById('page-form');
    this.container.classList.add('active');
    this._render();
    this._bindEvents();
  }

  destroy() {
    this._unbindEvents();
    this.container.classList.remove('active');
  }

  setAIAdapter(adapter) {
    this.aiAdapter = adapter;
  }

  // ========== Render ==========
  _render() {
    const s = this.state.getState();
    this.container.innerHTML = `
      <div class="container">
        <!-- Progress -->
        <div class="cp-progress">
          <div class="cp-progress-bar"><div class="cp-progress-fill" style="width:${s.formStep / 5 * 100}%"></div></div>
          <div class="cp-progress-text">${s.formStep} / 5</div>
        </div>

        <!-- Step content -->
        <div class="cp-step" id="cp-step-content">
          ${this._renderStep(s.formStep)}
        </div>

        <!-- Navigation -->
        <div class="cp-btn-group">
          ${s.formStep > 1 ? '<button class="cp-btn cp-btn-ghost" id="cp-prev">← 上一步</button>' : '<div></div>'}
          ${s.formStep < 5
            ? '<button class="cp-btn cp-btn-primary" id="cp-next">下一步 →</button>'
            : '<button class="cp-btn cp-btn-primary" id="cp-analyze">✦ 开始分析</button>'}
        </div>
      </div>`;
  }

  _renderStep(step) {
    const s = this.state.getState();
    switch (step) {
      case 1: return this._renderBasicInfo(s);
      case 2: return this._renderCareerIntent(s);
      case 3: return this._renderSkills(s);
      case 4: return this._renderPreferences(s);
      case 5: return this._renderExtra(s);
      default: return '';
    }
  }

  _renderBasicInfo(s) {
    return `
      <div class="cp-step-title">基本信息</div>
      <div class="cp-step-desc">让我们先了解一下你的背景</div>

      <div class="cp-form-group">
        <label class="cp-label">姓名或昵称</label>
        <input class="cp-input" id="cp-name" type="text" placeholder="怎么称呼你？" value="${this._esc(s.basicInfo.name)}">
      </div>

      <div class="cp-form-group">
        <label class="cp-label">年级<span class="required">*</span></label>
        <div class="cp-tags" id="cp-grade">
          ${GRADES.map(g => `<span class="cp-tag ${s.basicInfo.grade === g ? 'active' : ''}" data-val="${g}">${g}</span>`).join('')}
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">专业方向<span class="required">*</span></label>
        <div class="cp-tags" id="cp-major">
          ${MAJORS.map(m => `<span class="cp-tag ${s.basicInfo.major === m ? 'active' : ''}" data-val="${m}">${m}</span>`).join('')}
        </div>
        <div class="cp-custom-row" id="cp-major-custom-row" style="display:${s.basicInfo.major === '其他' ? 'flex' : 'none'}">
          <input class="cp-custom-input" id="cp-major-custom" type="text" placeholder="请输入你的专业" value="${this._esc(s.basicInfo.majorCustom)}">
        </div>
      </div>`;
  }

  _renderCareerIntent(s) {
    return `
      <div class="cp-step-title">职业意向</div>
      <div class="cp-step-desc">你对哪些方向感兴趣？可多选</div>

      <div class="cp-form-group">
        <label class="cp-label">感兴趣的行业</label>
        <div class="cp-tags" id="cp-industries">
          ${INDUSTRIES.map(i => `<span class="cp-tag ${(s.careerIntent.industries || []).includes(i) ? 'active' : ''}" data-val="${i}">${i}</span>`).join('')}
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">期望岗位方向</label>
        <div class="cp-tags" id="cp-roles">
          ${ROLES.map(r => `<span class="cp-tag ${(s.careerIntent.roles || []).includes(r) ? 'active' : ''}" data-val="${r}">${r}</span>`).join('')}
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">长期职业目标</label>
        <textarea class="cp-textarea" id="cp-goal" placeholder="例如：5年内成为数据分析师，10年走向管理层">${this._esc(s.careerIntent.goal)}</textarea>
      </div>`;
  }

  _renderSkills(s) {
    return `
      <div class="cp-step-title">能力评估</div>
      <div class="cp-step-desc">客观认识自己的能力，才能精准规划</div>

      <div class="cp-form-group">
        <label class="cp-label">已有技能 / 证书</label>
        <div class="cp-tags" id="cp-existing">
          ${EXISTING_SKILLS.map(sk => `<span class="cp-tag ${(s.skills.existing || []).includes(sk) ? 'active' : ''}" data-val="${sk}">${sk}</span>`).join('')}
        </div>
        <div class="cp-custom-row">
          <input class="cp-custom-input" id="cp-existing-custom" type="text" placeholder="添加自定义技能">
          <button class="cp-custom-add" data-target="existing">+ 添加</button>
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">核心优势</label>
        <div class="cp-tags" id="cp-strengths">
          ${STRENGTHS_LIST.map(st => `<span class="cp-tag ${(s.skills.strengths || []).includes(st) ? 'active' : ''}" data-val="${st}">${st}</span>`).join('')}
        </div>
        <div class="cp-custom-row">
          <input class="cp-custom-input" id="cp-strengths-custom" type="text" placeholder="添加自定义优势">
          <button class="cp-custom-add" data-target="strengths">+ 添加</button>
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">待提升领域</label>
        <div class="cp-tags" id="cp-gaps">
          ${GAPS_LIST.map(g => `<span class="cp-tag ${(s.skills.gaps || []).includes(g) ? 'active' : ''}" data-val="${g}">${g}</span>`).join('')}
        </div>
        <div class="cp-custom-row">
          <input class="cp-custom-input" id="cp-gaps-custom" type="text" placeholder="添加自定义领域">
          <button class="cp-custom-add" data-target="gaps">+ 添加</button>
        </div>
      </div>`;
  }

  _renderPreferences(s) {
    return `
      <div class="cp-step-title">工作偏好</div>
      <div class="cp-step-desc">你对工作环境有什么期待？</div>

      <div class="cp-form-group">
        <label class="cp-label">期望城市</label>
        <div class="cp-tags" id="cp-cities">
          ${CITIES.map(c => `<span class="cp-tag ${(s.preferences.cities || []).includes(c) ? 'active' : ''}" data-val="${c}">${c}</span>`).join('')}
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">工作强度偏好</label>
        <div class="cp-tags" id="cp-workload">
          ${WORKLOADS.map(w => `<span class="cp-tag ${s.preferences.workload === w ? 'active' : ''}" data-val="${w}">${w}</span>`).join('')}
        </div>
      </div>

      <div class="cp-form-group">
        <label class="cp-label">薪资预期</label>
        <div class="cp-tags" id="cp-salary">
          ${SALARIES.map(sl => `<span class="cp-tag ${s.preferences.salary === sl ? 'active' : ''}" data-val="${sl}">${sl}</span>`).join('')}
        </div>
      </div>`;
  }

  _renderExtra(s) {
    return `
      <div class="cp-step-title">补充信息</div>
      <div class="cp-step-desc">还有什么想告诉 AI 顾问的？</div>

      <div class="cp-form-group">
        <label class="cp-label">自由补充</label>
        <textarea class="cp-textarea" id="cp-extra" placeholder="可以描述你的具体情况、困惑、特别关注的方面等……">${this._esc(s.extra)}</textarea>
      </div>

      <div class="cp-card" style="margin-top:16px">
        <div style="color:var(--f-gold,#f5c971);font-size:13px;font-weight:500;margin-bottom:6px">💡 提示</div>
        <div style="color:var(--t-3,rgba(198,205,236,0.50));font-size:13px;font-weight:300;line-height:1.6">
          你可以补充：家庭期望、性格特点、求职困惑、实习/项目经历、考研/留学打算等。信息越丰富，AI 给出的路径规划越精准。
        </div>
      </div>`;
  }

  // ========== Events ==========
  _bindEvents() {
    // 先解绑旧事件，防止重复绑定
    this._unbindEvents();

    this._boundClick = (e) => this._handleClick(e);
    this._boundInput = (e) => this._handleInput(e);

    this.container.addEventListener('click', this._boundClick);
    this.container.addEventListener('input', this._boundInput);
  }

  _unbindEvents() {
    if (this._boundClick) {
      this.container.removeEventListener('click', this._boundClick);
      this._boundClick = null;
    }
    if (this._boundInput) {
      this.container.removeEventListener('input', this._boundInput);
      this._boundInput = null;
    }
  }

  _handleInput(e) {
    const id = e.target.id;
    if (id === 'cp-name') {
      this.state.setState(s => { s.basicInfo.name = e.target.value; return s; });
    } else if (id === 'cp-goal') {
      this.state.setState(s => { s.careerIntent.goal = e.target.value; return s; });
    } else if (id === 'cp-extra') {
      this.state.setState(s => { s.extra = e.target.value; return s; });
    } else if (id === 'cp-major-custom') {
      this.state.setState(s => { s.basicInfo.majorCustom = e.target.value; return s; });
    }
  }

  _handleClick(e) {
    // 1. 导航按钮（优先处理，return 防止冒泡到标签逻辑）
    const prevBtn = e.target.closest('#cp-prev');
    if (prevBtn) { this._goPrev(); return; }

    const nextBtn = e.target.closest('#cp-next');
    if (nextBtn) { this._goNext(); return; }

    const analyzeBtn = e.target.closest('#cp-analyze');
    if (analyzeBtn) { this._startAnalysis(); return; }

    // 2. 自定义添加按钮
    const addBtn = e.target.closest('.cp-custom-add');
    if (addBtn) { this._handleCustomAdd(addBtn); return; }

    // 3. 标签点击
    const tag = e.target.closest('.cp-tag');
    if (!tag || !tag.parentElement) return;

    const val = tag.dataset.val;
    const parentId = tag.parentElement.id;

    if (SINGLE_SELECT_GROUPS.has(parentId)) {
      this._handleSingleSelect(parentId, val);
    } else if (MULTI_SELECT_MAP[parentId]) {
      this._handleMultiSelect(parentId, val);
    }
  }

  // ========== Selection handlers ==========
  _handleSingleSelect(groupId, val) {
    const statePath = SINGLE_SELECT_MAP[groupId];
    if (!statePath) return;

    const parts = statePath.split('.');
    const s = this.state.getState();
    const currentVal = s[parts[0]][parts[1]];

    // 如果再次点击已选中的，取消选择
    const newVal = currentVal === val ? '' : val;
    this.state.setState(s2 => { s2[parts[0]][parts[1]] = newVal; return s2; });

    // 更新 DOM：只更新 active 状态
    const tags = this.container.querySelectorAll(`#${groupId} .cp-tag`);
    tags.forEach(t => t.classList.toggle('active', t.dataset.val === newVal));

    // 专业"其他"显示/隐藏自定义输入框
    if (groupId === 'cp-major') {
      const customRow = this.container.querySelector('#cp-major-custom-row');
      if (customRow) customRow.style.display = newVal === '其他' ? 'flex' : 'none';
    }
  }

  _handleMultiSelect(groupId, val) {
    const statePath = MULTI_SELECT_MAP[groupId];
    if (!statePath) return;

    const parts = statePath.split('.');
    const s = this.state.getState();
    let arr = [...(s[parts[0]][parts[1]] || [])];

    const idx = arr.indexOf(val);
    if (idx >= 0) {
      arr.splice(idx, 1); // 取消选择
    } else {
      arr.push(val); // 添加选择
    }

    this.state.setState(s2 => { s2[parts[0]][parts[1]] = arr; return s2; });

    // 更新 DOM
    const tags = this.container.querySelectorAll(`#${groupId} .cp-tag`);
    tags.forEach(t => t.classList.toggle('active', arr.includes(t.dataset.val)));
  }

  _handleCustomAdd(addBtn) {
    const target = addBtn.dataset.target;
    const input = this.container.querySelector(`#cp-${target}-custom`);
    if (!input || !input.value.trim()) return;

    const val = input.value.trim();
    const tagsContainer = this.container.querySelector(`#cp-${target}`);
    if (!tagsContainer) return;

    // 检查是否已存在
    const existingTags = tagsContainer.querySelectorAll('.cp-tag');
    const existingVals = [...existingTags].map(t => t.dataset.val);
    if (existingVals.includes(val)) { input.value = ''; return; }

    // 添加新标签到 DOM
    const newTag = document.createElement('span');
    newTag.className = 'cp-tag active';
    newTag.dataset.val = val;
    newTag.textContent = val;
    tagsContainer.appendChild(newTag);

    // 更新 state
    const stateMap = { existing: 'skills.existing', strengths: 'skills.strengths', gaps: 'skills.gaps' };
    const stateKey = stateMap[target];
    if (stateKey) {
      const s = this.state.getState();
      const parts = stateKey.split('.');
      const arr = [...(s[parts[0]][parts[1]] || []), val];
      this.state.setState(s2 => { s2[parts[0]][parts[1]] = arr; return s2; });
    }
    input.value = '';
  }

  // ========== Navigation ==========
  _goPrev() {
    this._saveCurrentStep();
    this.state.setState(s => { s.formStep = Math.max(1, s.formStep - 1); return s; });
    this._render();
    this._bindEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _goNext() {
    if (!this._validateStep()) return;
    this._saveCurrentStep();
    this.state.setState(s => { s.formStep = Math.min(5, s.formStep + 1); return s; });
    this._render();
    this._bindEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _saveCurrentStep() {
    const c = this.container;
    const nameEl = c.querySelector('#cp-name');
    if (nameEl) this.state.setState(s2 => { s2.basicInfo.name = nameEl.value; return s2; });
    const goalEl = c.querySelector('#cp-goal');
    if (goalEl) this.state.setState(s2 => { s2.careerIntent.goal = goalEl.value; return s2; });
    const extraEl = c.querySelector('#cp-extra');
    if (extraEl) this.state.setState(s2 => { s2.extra = extraEl.value; return s2; });
    const majorCustomEl = c.querySelector('#cp-major-custom');
    if (majorCustomEl) this.state.setState(s2 => { s2.basicInfo.majorCustom = majorCustomEl.value; return s2; });
  }

  _validateStep() {
    const s = this.state.getState();
    switch (s.formStep) {
      case 1:
        if (!s.basicInfo.grade) { this._shake('#cp-grade'); return false; }
        if (!s.basicInfo.major) { this._shake('#cp-major'); return false; }
        return true;
      default:
        return true;
    }
  }

  _shake(selector) {
    const el = this.container.querySelector(selector);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // force reflow
    el.style.animation = 'cpShake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }

  // ========== Analysis ==========
  async _startAnalysis() {
    const s = this.state.getState();
    this.state.setState(s2 => { s2.analyzing = true; return s2; });

    this.container.innerHTML = `
      <div class="cp-analyzing">
        <div class="cp-analyzing-icon">✦</div>
        <div class="cp-analyzing-text">AI 顾问正在为你分析职业路径</div>
        <div class="cp-analyzing-sub">综合你的背景、意向和能力，生成个性化发展建议……</div>
      </div>`;

    try {
      const context = {
        basicInfo: s.basicInfo,
        careerIntent: s.careerIntent,
        skills: s.skills,
        preferences: s.preferences,
        extra: s.extra,
      };

      const adapter = this.aiAdapter || (await import('../ai-adapter.js')).createCareerAdapter();
      const result = await adapter.generateCareerPlan(context);

      this.state.setState(s2 => {
        s2.result = result;
        s2.analyzing = false;
        return s2;
      });

      this.router.navigate('result');
    } catch (err) {
      console.error('Career analysis failed:', err);
      this.state.setState(s2 => { s2.analyzing = false; return s2; });
      this.container.innerHTML = `
        <div class="cp-analyzing">
          <div class="cp-analyzing-icon">⚠️</div>
          <div class="cp-analyzing-text">分析过程出现问题</div>
          <div class="cp-analyzing-sub">${err.message || '请稍后重试'}</div>
          <button class="cp-btn cp-btn-ghost" style="margin-top:20px" id="cp-retry">重新尝试</button>
        </div>`;
      this._bindEvents();
      this.container.querySelector('#cp-retry')?.addEventListener('click', () => this._startAnalysis());
    }
  }

  _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
