# 唯一图片风格基准：粗蜡笔手绘（2026-10-25）

用户本轮指定 image(20261025-062532).png 为全项目统一参考，范围是封面与全部剧情图片。此文覆盖旧版铅笔淡彩、精致动画背景等冲突说明。

- 永久参考：reference-preview/crayon-master-20261025.png。每次直接携带用户原图；不能只用上一张生成图滚动参考。
- 人物：保持原图脸型、比例与穿着。小梦短棕发、淡黄星形发夹、浅黄外套、灰蓝牛仔裤、白鞋；小五凌乱深棕发、灰蓝衬衫、米白内搭、米色裤子、白鞋与深色背包。不画成幼儿比例。
- 材质：粗蜡笔与彩铅的颗粒、断线、排线、纸纹。笔触粗糙但人物、手与道具清晰，不能用像素模糊模拟手绘粗糙。
- 背景：比参考图更简化、朦胧，以少量宽色块和必要轮廓交代地点。省略复杂建筑、密集树叶、舞台结构、人群和灯串；通过抽象实现朦胧，不模糊整张图片。
- 色彩：低饱和奶黄、灰蓝、灰棕，按故事时间调整明暗。开场为蓝灰夜景，禁止逐张漂移为橙色日落。
- 构图：逐镜独立生成铺满的16:9横图。全部出场人物全头、全脸完整入画，头顶和侧边留空间，不要求每次全身。特写也不能切半张脸。
- 禁止：九宫格裁切、小图简单放大冒充高清、精致数码动画、照片背景、强橙色逆光、编辑分享按钮、字幕、气泡、水印。
- 剧情：未接受耳机前男孩不佩戴，已共享后每人一只；帽子、水杯、笔、本子等按剧情连续。

运行清单：src/data/individualArt.json。只有本风格实际生成并检查的独立图片计入完成；旧版和被拒绝文件不计数。scripts/register-crayon-art.mjs 从实际清单更新 INDIVIDUAL_ART_PROGRESS.json，不手写完成数量。

保留每张图片的实际原生像素尺寸。1672×941不能标称原生4K或1920×1080；它是独立整幅原画，旧九宫格单格约557×314。未重画部分暂用旧素材。

依照用户此前要求：仅修改本地素材与必要绑定，不启动浏览器，不运行测试、构建或部署。


ANATOMY LOCK: Check true left versus right hands and wrist connections, not only digit count. A girl's LEFT hand pointing across the desk has its thumb on the near/lower side toward the viewer; do not draw a second right hand with an outward/reversed thumb. Relaxed palm-down hands must also have correctly placed inward thumbs. Five digits total, no extra arms or fused fingers.


BACKGROUND MEMORY LOCK: Use broad nearly empty wax-crayon color fields and only necessary location props. Do not gradually add dense trees, fences, lamps, architecture or crowd detail. Omit secondary people rather than showing cropped heads or faces. Always inspect the complete original reference, not a tiny texture-only preview.


## 用户补充：成长与分组

画风不变不代表年龄冻结。人物随高中、大学及后续阶段自然长大，保留头发、发夹、脸部等辨识度；脸型、身形、气质与穿着按剧情阶段渐进变化。用户认可目前的成长感，不回退为低龄比例。粗蜡笔笔触、纸纹、背景简化规则保持不变。

按场景灵活分组，通常每组5幅便于检查，不再强制每轮50幅。


## 持续执行授权

用户已授权持续生成、分组检查、必要修正并接入，不需要每组再次输入继续。每一阶段均以最初原图为画风基准，不用后续生成图滚动替代；人物可随剧情自然成长。完成一组后自动推进下一组，遇到实际工具或系统阻断时保存当前进度。
