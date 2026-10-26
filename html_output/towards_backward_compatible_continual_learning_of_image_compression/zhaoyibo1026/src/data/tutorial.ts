import type { TutorialData } from '../types';

export const tutorial: TutorialData = {
  "meta": {
    "titleEn": "Towards Backward-Compatible Continual Learning of Image Compression",
    "titleZh": "图像压缩的后向兼容持续学习",
    "venue": "arXiv:2402.18862v1 · 2024",
    "authors": "Zhihao Duan, Ming Lu, Justin Yang, Jiangpeng He, Zhan Ma, Fengqing Zhu",
    "affiliation": "Purdue University · Nanjing University",
    "domain": "图像压缩 · 持续学习 · 熵编码",
    "coreProblem": "微调后的解码器无法解码旧码流，已有存档失去可读性。",
    "coreInsight": "冻结熵模型保住旧码流，再用知识回放微调编码器与解码器，并让熵模型只占少量参数。",
    "keywords": [
      "后向兼容",
      "知识回放",
      "学习式图像压缩",
      "变码率"
    ]
  },
  "hero": {
    "oldMethod": {
      "desc": "直接微调后，旧唱片跳针，旧码流解不回来。",
      "componentId": "vinyl-hero"
    },
    "newMethod": {
      "desc": "冻结播放标准，再用知识回放，旧唱片照放、新唱片也能放。",
      "componentId": "vinyl-hero"
    }
  },
  "chapters": [
    {
      "kind": "chapter",
      "id": "chap-1",
      "title": "换了唱针，旧唱片还能放吗",
      "badge": "inf",
      "badgeLabel": "问题引入",
      "bridge": "旧唱片明明没动，声音却断了。先看清是哪一环在变，再谈怎么修。",
      "analogy": {
        "title": "换了唱针，旧唱片却跳针",
        "text": "唱片还是那张唱片（<b>旧码流</b>没变），可新唱针（<b>新解码器</b>）对不上纹槽，声音就断了。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "1.1",
          "title": "改动范围越大，旧唱片越放不稳",
          "desc": "拖动滑块改变微调范围，观察旧码流还能不能被正确解码。三个档位对应论文表 3 中 MSH-VR 的三种配置：原装、只微调编码器、编码器+解码器，中间不做插值。",
          "componentId": "ch1mod1"
        },
        {
          "kind": "module",
          "id": "1.2",
          "title": "同一段码流，两个解码器",
          "desc": "按下开始，让原解码器与微调后的解码器同时读取同一段旧码流，看两边还原出的画面如何分岔。",
          "componentId": "ch1mod2"
        }
      ],
      "insight": "唱片本身没坏，坏的是播放链：解码器一变，旧码流即使还能读出符号，也还原不回原来的画面。",
      "formula": {
        "lead": "压缩器平时就在优化这个率失真目标。",
        "unicode": "min 𝔼[ −log₂ p_Z(Z) + λ · d(X, X̂) ]",
        "symbols": [
          {
            "sym": "p_Z",
            "desc": "熵模型，给潜变量分配概率"
          },
          {
            "sym": "λ",
            "desc": "拉格朗日乘子，权衡码率与失真"
          },
          {
            "sym": "d(X, X̂)",
            "desc": "原图与重建图之间的失真"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "后向兼容的定义",
          "desc": "新模型要能解码旧模型产生的码流。"
        },
        {
          "icon": "🔧",
          "title": "是谁破坏了兼容",
          "desc": "只改编码器不破坏兼容；改了解码器就可能。"
        },
        {
          "icon": "✨",
          "title": "论文要解决的问题",
          "desc": "让解码器也能更新，同时旧码流照读。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-2",
      "title": "纹槽里到底存了什么",
      "badge": "inf",
      "badgeLabel": "表示与码流",
      "bridge": "要判断旧码流为什么读不回来，先得知道码流里到底存了什么。",
      "analogy": {
        "title": "纹槽不是画面，是符号",
        "text": "放大镜下的纹槽只是一串起伏（<b>潜变量</b>），要按播放标准（<b>熵模型</b>）才能读回声音。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "2.1",
          "title": "四层纹槽，四级潜变量",
          "desc": "点击唱片上的任意一圈纹槽，查看这一级潜变量的空间尺寸与通道数；四级从粗到细，各自形成一路码流。",
          "componentId": "ch2mod1"
        }
      ],
      "insight": "码流不是像素的压缩包，而是一组按层级组织、需要用概率模型读出的潜变量。",
      "formula": {
        "lead": "每一级潜变量都被建模成一个离散高斯分布。",
        "unicode": "pᵢ(zᵢ) = ∫ N(t; μᵢ, σᵢ²) dt，积分区间是 [zᵢ−0.5, zᵢ+0.5]",
        "symbols": [
          {
            "sym": "zᵢ",
            "desc": "第 i 阶段的潜变量"
          },
          {
            "sym": "μᵢ, σᵢ",
            "desc": "熵模型由前级 z<i 预测的均值与尺度"
          },
          {
            "sym": "N(t; μᵢ, σᵢ²)",
            "desc": "高斯密度"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "码流的内容",
          "desc": "码流里存的是四级潜变量，不是像素。"
        },
        {
          "icon": "🔧",
          "title": "四级尺寸",
          "desc": "空间尺寸从 4×4 到 32×32，通道数依次为 128、256、384、256。"
        },
        {
          "icon": "✨",
          "title": "分级编码",
          "desc": "每一级都单独熵编码，单独形成一路码流。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-3",
      "title": "关键一步：冻结播放标准",
      "badge": "inf",
      "badgeLabel": "核心洞察",
      "bridge": "既然解码器一改就出事，能不能把“标准”和“读者”拆开？",
      "analogy": {
        "title": "标准锁住，旧唱片才稳",
        "text": "两台唱盘同时播放；只有把<b>播放标准</b>（pZ）锁住，唱针才认得出同一条纹槽。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "3.1",
          "title": "冻结标准，潜变量原样回来",
          "desc": "按下播放，左右两台唱盘同时读取同一段旧码流：左边冻结 pZ，右边让 pZ 一起变。观察哪一边还能拿回同一组潜变量。",
          "componentId": "ch3mod1"
        }
      ],
      "insight": "pZ 不是普通的一层网络，而是编码器与解码器之间的共同标准；标准一动，旧码流就可能解不出原来的符号。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "pZ 的角色",
          "desc": "pZ 是编码器与解码器之间的共同标准。"
        },
        {
          "icon": "🔧",
          "title": "冻结的收益",
          "desc": "冻结 pZ，旧码流才能还原出同一组潜变量。"
        },
        {
          "icon": "✨",
          "title": "还差一步",
          "desc": "只冻结还不够，解码器还需要回放训练。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-4",
      "title": "调音台：新旧两项怎么混",
      "badge": "both",
      "badgeLabel": "核心公式",
      "bridge": "冻结 pZ 让旧码流能解，但新解码器还没学会“像原来那样”还原。回放训练补的就是这一课。",
      "analogy": {
        "title": "推子两边，旧曲与新曲",
        "text": "往右推（<b>α</b> 增大）多放旧唱片，旧码流更稳；往左拉（<b>α</b> 减小）多放新唱片，新数据更好。推子就是 <b>α</b>。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "4.1",
          "title": "拖动 α，看两项此消彼长",
          "desc": "拖动调音台推子，在五个实测档位之间切换；右侧两个表分别显示旧码流与新数据的 BD-Rate。数值来自论文的 α 消融表。",
          "componentId": "ch4mod1"
        }
      ],
      "insight": "知识回放会把旧训练集和旧编码器留在缓冲区，每轮用旧编码器重跑旧数据，把新解码器拉回原来的输出。",
      "formula": {
        "lead": "回放项只看失真，再用 α 和新数据项加权。",
        "unicode": "ℓ_KR = 𝔼[ Λ⁽⁰⁾ · d(X⁽⁰⁾, f_dec⁽¹⁾(f_enc⁽⁰⁾(X⁽⁰⁾))) ]，min (1−α)·ℓ_new + α·ℓ_KR",
        "symbols": [
          {
            "sym": "f_enc⁽⁰⁾",
            "desc": "冻结的旧编码器"
          },
          {
            "sym": "f_dec⁽¹⁾",
            "desc": "当前正在训练的解码器"
          },
          {
            "sym": "D⁽⁰⁾",
            "desc": "旧数据经过旧编码器与新解码器后的失真"
          },
          {
            "sym": "α",
            "desc": "回放权重，默认 0.5"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "回放项只算失真",
          "desc": "旧编码器固定，码率项是常数，所以只保留失真。"
        },
        {
          "icon": "🔧",
          "title": "两项加权",
          "desc": "总损失按 α 混合新数据项与回放项。"
        },
        {
          "icon": "✨",
          "title": "默认值",
          "desc": "α 在 0.25 到 0.75 之间平均表现接近，默认取 0.5。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-5",
      "title": "为不同唱片配唱头",
      "badge": "both",
      "badgeLabel": "条件与变码率",
      "bridge": "数据会换，码率范围也会换。模型要能用一个身子适配多种播放条件。",
      "analogy": {
        "title": "换唱头，也要调针压",
        "text": "不同的唱片要配不同的唱头与针压；<b>λ</b> 就是那组让同一个唱机适配不同码率的设置。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "5.1",
          "title": "三个 λ 采样点，一条仿射支路",
          "desc": "选择低、中、高三个 λ 采样点，观察唱头与针压的变化，同时看右侧 λ 仿射块如何缩放和偏移特征。方向依据论文的 λ 条件机制，不显示未报告的精确码率。",
          "componentId": "ch5mod1"
        }
      ],
      "insight": "变码率不是训练多个模型，而是在每个卷积块里注入 λ，让同一套权重在不同码率下工作。",
      "formula": {
        "lead": "变码率训练把每一级的码率加起来，再让 Λ 乘上失真。",
        "unicode": "min 𝔼[ Σᵢ₌₁ᴺ −log₂ pᵢ(Zᵢ|Λ) + Λ · d(X, X̂) ]",
        "symbols": [
          {
            "sym": "N",
            "desc": "阶段数，本文为 4"
          },
          {
            "sym": "pᵢ(Zᵢ|Λ)",
            "desc": "第 i 级在给定 λ 下的概率"
          },
          {
            "sym": "Λ",
            "desc": "训练时从 pΛ 采样的 λ"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "λ 的进入方式",
          "desc": "λ 通过每个 ConvNeXt 块的仿射变换进入网络。"
        },
        {
          "icon": "🔧",
          "title": "λ 的方向",
          "desc": "λ 越大越偏向质量，码率也随之升高。"
        },
        {
          "icon": "✨",
          "title": "一个模型覆盖面",
          "desc": "一个模型覆盖一段码率范围，不必为每个码率单独训练。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-6",
      "title": "抬臂逐段：解码链怎么走",
      "badge": "inf",
      "badgeLabel": "解码执行",
      "bridge": "标准锁住、损失定好之后，真正的解码是一段一段往下走的。",
      "analogy": {
        "title": "一面唱片，分四段播",
        "text": "唱针不会跳过任何一段；解码器也要按阶段一、二、三、四依次把潜变量取回来。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "6.1",
          "title": "从 z₁ 到重建图",
          "desc": "用上一步、下一步走完解码流程；每一步显示当前阶段、张量尺寸和正在更新的支路。最后一步把特征上采样回 256×256 图像。",
          "componentId": "ch6mod1"
        }
      ],
      "insight": "解码是自上而下、逐级条件化的：后一级要等前一级的潜变量解出来，最后才轮到像素。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "解码顺序",
          "desc": "先由 pZ 自上而下预测分布，再由 fdec 自上而下重建。"
        },
        {
          "icon": "🔧",
          "title": "四级潜变量",
          "desc": "四个阶段依次解出 z₁ 到 z₄，尺寸逐级变大。"
        },
        {
          "icon": "✨",
          "title": "最后一步",
          "desc": "上采样回 256×256×3 的图像。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-7",
      "title": "反复试听旧唱片：回放怎么训",
      "badge": "trn",
      "badgeLabel": "训练",
      "bridge": "回放项写起来只有一行，但“回放什么”和“怎么回放”是两件事，效果也不同。",
      "analogy": {
        "title": "用旧母带校准新唱针",
        "text": "每调一次新唱针，就放一张旧母带对照；<b>旧数据</b>和<b>回放损失</b>一起把旧唱片守住。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "7.1",
          "title": "四种配方，四种旧码流表现",
          "desc": "依次选择四种回放配方，观察旧码流与新数据的 BD-Rate 如何变化。四组数字都来自论文的数据增量消融表。",
          "componentId": "ch7mod1"
        }
      ],
      "insight": "回放数据和回放损失都有用，但损失更关键；两者合在一起，旧码流甚至比预训练模型还稳。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "只加数据",
          "desc": "回放旧数据能把旧码流从 262.9% 降到 23%。"
        },
        {
          "icon": "🔧",
          "title": "再加损失",
          "desc": "回放损失再把它压到 3.67%，两者一起用是 0.87%。"
        },
        {
          "icon": "✨",
          "title": "谁更关键",
          "desc": "回放损失比回放数据更关键。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-8",
      "title": "打开唱机：两条支路",
      "badge": "trn",
      "badgeLabel": "架构",
      "bridge": "训练方法成立的前提，是冻结的那一块足够小。架构就是为这件事设计的。",
      "analogy": {
        "title": "掀开底座，看两条传动",
        "text": "熵模型和解码器各走一条支路；把轻的那条冻住，重的那条才留得下可训练的参数。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "8.1",
          "title": "并行支路与串行堆叠",
          "desc": "切换两种接法：并行时 pZ 与 fdec 各走一条支路；串行时 pZ 叠在 fdec 前面。观察旧码流与新数据结果的变化，并留意并行支路下 pZ 的参数占比。",
          "componentId": "ch8mod1"
        },
        {
          "kind": "module",
          "id": "8.2",
          "title": "熵模型到底占多少参数",
          "desc": "点击任意一根条，查看该模型的总参数与熵模型参数。条越长代表总参数越多，紫色段是熵模型。",
          "componentId": "ch8mod2"
        }
      ],
      "insight": "论文不是先有并行支路再谈持续学习，而是为了让“冻结一小块”成立，专门把熵模型做轻、拆开。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "并行支路的收益",
          "desc": "并行支路让 pZ 只占 4.9M，总参数的 14%。"
        },
        {
          "icon": "🔧",
          "title": "串行版本",
          "desc": "同等参数量下，串行版本加 KR 也只有 −6.31% 平均。"
        },
        {
          "icon": "✨",
          "title": "两者配合",
          "desc": "架构和回放策略一起，才让“冻住一小块、训练一大块”成立。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-9",
      "title": "旧唱片体检：指标怎么读",
      "badge": "trn",
      "badgeLabel": "评测与实用",
      "bridge": "方法讲完，最后要落到数字上。先学会分开读两列，再比较谁更好。",
      "analogy": {
        "title": "先体检，再试听",
        "text": "旧唱片要先确认纹槽完好，再谈音质；旧码流也要先确认还能解码，再谈 PSNR。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "9.1",
          "title": "三项读数，别混在一起",
          "desc": "选择三种解码配置，分别查看旧码流 BD-Rate 与新数据 BD-Rate；右侧大数字是两列的平均 BD-Rate。所有 BD-Rate 都以 VTM 22.0 为锚点，越低越好；PSNR 按 RGB 计算。数据增量用 COCO 预训练、CelebA 微调，旧码流在 Kodak、新数据在 CelebA 上评测；码率增量在 Kodak 上评测。注意旧码流的 bpp 是固定的，变化的是重建 PSNR 对应的 BD-Rate。",
          "componentId": "ch9mod1"
        }
      ],
      "insight": "后向兼容的评测不是“平均一张图”，而是两套协议：旧码流解码得怎样，新数据压缩得怎样，必须分开报。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "旧码流列",
          "desc": "旧码流的 bpp 固定，变的是重建 PSNR 对应的 BD-Rate。"
        },
        {
          "icon": "🔧",
          "title": "直接微调的假象",
          "desc": "在数据增量里，它只在新数据列好看，旧码流列会明显恶化。"
        },
        {
          "icon": "✨",
          "title": "读表习惯",
          "desc": "先看列名和协议，再比数字。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-10",
      "title": "试听对比：谁真的保住了旧唱片",
      "badge": "both",
      "badgeLabel": "结果与边界",
      "bridge": "最后一轮，把三个场景放到同一张桌上比。",
      "analogy": {
        "title": "三张唱片，一张一张试",
        "text": "同一台唱机依次试三种方案；最后留下的绿色标记，是既保住旧唱片又能放新唱片的那一个。",
        "componentId": "vinyl-analogy"
      },
      "modules": [
        {
          "kind": "module",
          "id": "10.1",
          "title": "三个场景，看平均 BD-Rate",
          "desc": "先选场景，再按开始对比。横轴是平均 BD-Rate，越低越好；码率增量的两个场景没有预训练模型的新码率结果，因此不画预训练参考线，也不把它放进平均值比赛。数据增量沿用预训练的 λ∈[32,1024]；低→高扩到 [32,4096]，高→低扩到 [4,1024]。",
          "componentId": "ch10mod1"
        }
      ],
      "insight": "优势不是某一格的偶然：数据增量和两个码率方向都成立，但作者也明确限定了只做解码器一侧、只做两步。",
      "takeaways": [
        {
          "icon": "🎯",
          "title": "数据增量",
          "desc": "本文平均 −7.87%，直接微调 122.0%。"
        },
        {
          "icon": "🔧",
          "title": "码率增量",
          "desc": "低到高 0.83%，高到低 2.56%，都优于直接微调。"
        },
        {
          "icon": "✨",
          "title": "边界",
          "desc": "只研究解码器一侧、假设训练资源充足、目前只做两步；多步持续学习是未来工作。"
        }
      ]
    }
  ]
};
