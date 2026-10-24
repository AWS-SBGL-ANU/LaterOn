import { backgroundArt } from '../domain/presentation.mjs';
export const places:Record<string,string>={BG01:'学校操场 · 看台',BG02:'窗边的课桌',BG03:'教室 · 晚自习',BG04:'教室后门',BG05:'体育馆外',BG06:'校门口公交站',BG07:'高三教室',BG08:'校门外的小面馆',BG09:'小区外的小桥',BG10:'机场 · 出发层',BG11:'两地的一通视频',BG12:'书桌与广播室',BG13:'大学广播楼外',BG14:'两地的房间',BG15:'站牌下面',BG16:'直播结束后的走廊',BG17:'约好一起听回放',BG18:'便利店与宿舍',BG19:'项目工作室',BG20:'工作楼外的雨棚',BG21:'家乡书店旁',BG22:'各自的房间',BG23:'早晨的小饭馆',BG24:'周末的厨房',BG25:'校庆 · 操场看台',BG26:'书店外的街角',BG27:'下班后的地铁'};
export function artFor(node:any,facts:any){return backgroundArt(node,facts,import.meta.env.BASE_URL);}
Object.assign(places,{BG28:'课桌之间 · 指尖',BG29:'校门口 · 冰淇淋小车',BG30:'放学后的长椅',BG31:'冬天的教室',BG32:'回家的公交车',BG33:'毕业后的教室'});
export const chapterNames:Record<string,string>={'chapter-1':'第一章 · 坐近一点','chapter-2':'第二章 · 没说完的话','chapter-3':'第三章 · 你的明天','chapter-4':'第四章 · 后来怎么过',epilogue:'尾声 · 后来的我们'};
