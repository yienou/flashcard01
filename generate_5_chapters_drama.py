import asyncio
import edge_tts
import os

BASE_DIR = os.path.dirname(__file__)

CHAPTERS = [
    {
        "ch": 1,
        "title": "Chapter 01: People（人物、王國與稱謂）",
        "episode": "EP1《少爺三年沒笑過了！真假千金的古堡打臉宴》",
        "mp3": "霸總Ch01_People_古堡王子的稱謂危機.mp3",
        "turns": [
            ("narrator", "zh-TW-HsiaoYuNeural",
             "歡迎收聽霸總短劇英文，第一章：People 人物篇！今晚，百億顧氏集團在歐洲買下的千年 castle 舉辦頂級晚宴。整座古堡金碧輝煌，貧窮的林小美因為幫朋友代班，穿著洗到發白的制服站在大廳角落，卻被勢利眼名媛當眾潑了一身紅酒！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "妳幹嘛故意撞我！就算我只是來打工的 servant，妳也不能隨便羞辱一個僕人吧！每個人生下來都是平等的 human，難道有錢人就比較高貴嗎？"),
            ("ceo", "zh-TW-YunJheNeural",
             "全場給我安靜！是誰敢在我的商業 kingdom 鬧事？在這座王國裡，我顧辰就是至高無上的 king，所有人都得聽我這個國王的號令！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "老管家李叔激動得老淚縱橫：天啊！少爺從小 baby 嬰兒剛 born 出生開始，在孤單的 childhood 童年時期長大，從一個小 boy 男孩變成 teenager 青少年，再到現在成為掌權的 adult 成年人，少爺已經整整三年沒笑過了！剛剛看到這位嗆辣的 girl 女孩，少爺居然笑了！"),
            ("ceo", "zh-TW-YunJheNeural",
             "女人，敢在宴會上頂撞名媛，妳成功引起我的注意了！從今天起，妳不再是什麼卑微的下人，我要把妳寵成這座古堡唯一的 princess 公主，甚至讓妳當我顧辰的 queen 皇后！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "這位穿西裝的 handsome 帥氣 guy，你這個傢伙該不會腦袋燒壞了吧？我才不想當什麼公主，你別自以為是童話故事裡的白馬王子 prince 喔！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "老管家嚇得倒抽一口涼氣：大膽！敢這麼跟我們家 master 主人說話，妳是第一個！全場的 gentleman 紳士跟 lady 淑女們聽好了，以後看到林小美，稱呼她的 title 頭銜給我放尊重點！不管各位是稱呼我家少爺 sir 還是 Mr. 顧先生，從今晚起，林小美就是少爺認定唯一的未婚妻！"),
            ("ceo", "zh-TW-YunJheNeural",
             "聽見沒有？我已經請王博士 Dr. Wang 幫妳驗過傷了。以後妳的姓氏 last name 冠上我的姓，從未婚的 Miss 林小姐，直接升格成已婚 married 的 Mrs. 顧太太！這輩子妳都逃不出我的手掌心了，my dear 親愛的！"),
        ]
    },
    {
        "ch": 2,
        "title": "Chapter 02: Occupations（職業、職場與成功）",
        "episode": "EP2《隱藏首富扮小司機！天涼了，讓王氏集團破產吧》",
        "mp3": "霸總Ch02_Occupations_地獄面試官與神祕小偷.mp3",
        "turns": [
            ("narrator", "zh-TW-HsiaoYuNeural",
             "第二章：Occupations 職業篇！為了試探林小美是不是拜金女，身為跨國 company 總裁的顧辰，故意隱瞞自己百億公司大老闆 boss 的身分，假裝成一個月薪三萬的窮 driver，每天開著破二手車當小美的司機兼小 assistant 助理。"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "顧辰，雖然你只是一個小小的私人司機跟助理，但我今天要去大集團參加 secretary 秘書職缺的 interview 面試，等我被錄取成為正式 worker 員工、賺到大錢之後，換我養你！"),
            ("ceo", "zh-TW-YunJheNeural",
             "這該死的女人，竟然這麼善良特別！好，我陪妳去面試現場！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "沒想到一走進面試大廳，囂張的部門 manager 經理王大衛，正摟著一位大牌女演員 actress 跟時尚 model 模特兒在炫耀：哈哈哈，林小美，妳也不看看自己什麼窮酸樣，還敢來應徵？我們今天 hire 雇用的可都是頂級菁英！有知名畫家 painter 跟 artist 藝術家、變魔術的 magician 魔術師、當紅 singer 歌手，妳身邊這個破司機算什麼東西？警衛！叫門口的 police 警察跟保全 officer 警官把他們轟出去，順便檢查他們是不是來偷東西的 thief 小偷！"),
            ("ceo", "zh-TW-YunJheNeural",
             "慢著！王經理，敢動我的女人，我看你是活膩了！特助 Kevin，三分鐘到了，不用再裝了，亮身分！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "下一秒，大門被踹開！集團最頂尖的十位 lawyer 律師、退休 judge 法官、首席 scientist 科學家跟 engineer 工程師，連同米其林主廚 cook 與五星級 waiter 服務生整齊列隊，全場九十度鞠躬高喊：參見總裁！總裁才是我們集團真正的 owner 所有人！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "什麼？！顧辰，你不是窮司機嗎？怎麼突然變成百億集團的大老闆了？！"),
            ("ceo", "zh-TW-YunJheNeural",
             "傻瓜，我不裝窮，怎麼能 discover 發現妳最真心、最 valuable 珍貴的善良？至於這個狗眼看人低的王經理，整天只會 complain 抱怨又欺負新人……Kevin，天涼了，取消跟王氏家族的百億 contract 合約，結束今天的 meeting 會議，讓他們破產吧！小美，只要妳繼續保持 positive 積極正面的態度、付出 effort 努力、遇到 difficult 困難保持 focus 專心，我的百億商業帝國，將來全部歸妳管，祝妳邁向 success 成功！"),
        ]
    },
    {
        "ch": 3,
        "title": "Chapter 03: Personal Characteristics（外貌、個性與情緒）",
        "episode": "EP3《少爺的潔癖過敏症！女人，妳在玩火》",
        "mp3": "霸總Ch03_Characteristics_傲嬌總裁的真心話.mp3",
        "turns": [
            ("narrator", "zh-TW-HsiaoYuNeural",
             "第三章：Personal Characteristics 外貌與個性篇！整個豪門圈都知道，顧辰少爺雖然長得又 tall 又 handsome，身材既高大帥氣、沒有半點 fat 肥肉，保持得非常精實 slim，但他的 character 性格卻極度古怪！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "老管家在旁邊小聲提醒：小美小姐，您千萬要小心 careful 一點！我們家少爺平常表情非常 serious 嚴肅認真，對外人甚至有點 cruel 冷酷無情。而且少爺有個怪病，只要距離別的女人太近，就會全身起紅疹、情緒失控變得 crazy 抓狂！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "真的假的？可是我這個人最 careless 粗心大意了……哎呀！（腳下一滑，整個人撲進顧總裁懷裡）"),
            ("ceo", "zh-TW-YunJheNeural",
             "不要動！女人，妳在玩火！再動一下，我不敢保證會發生什麼！奇怪……我碰到這個女人，竟然沒有過敏？而且我的心情還覺得特別 peaceful 平靜舒服？"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "誰在玩火啦！是你自己走路不看路，態度還這麼 rude 粗魯霸道！虧你長得這麼帥，結果個性這麼 childish，像個幼稚的小學生一樣！每次看到男同事跟我講話，你就變得超 jealous 嫉妒吃醋，有夠小氣 stingy 的！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "老管家嚇得下巴都掉下來了：天啊！全天下敢罵少爺幼稚又小氣的，妳是第一個！少爺一定會非常 angry 生氣發飆……等等，少爺居然沒有生氣，反而笑得超 happy 開心？！"),
            ("ceo", "zh-TW-YunJheNeural",
             "哼，本總裁一向很 calm 冷靜沉著，而且我捐錢做慈善的時候超級 generous 慷慨大方，哪裡小氣了？我只是欣賞這個女人說話 honest 誠實不造作，工作又 hard-working 勤奮努力，面對惡勢力非常 brave 勇敢，從來不會 scared 害怕退縮！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "突然被你這麼誇獎，害我臉紅起來，覺得有點 shy 害羞又有點 nervous 緊張耶！其實我剛進豪門當 beginner 新手，不是什麼聰明的 genius 天才，很怕自己太 silly 傻呼呼幫倒忙。"),
            ("ceo", "zh-TW-YunJheNeural",
             "傻女人，在別人面前我可以冷酷，但對妳，我永遠會保持最 gentle 溫柔、最 considerate 體貼的一面。我很 believe 相信妳的 talent 天分，有我在，絕對不讓妳感到 sad 難過或 lonely 孤單！"),
        ]
    },
    {
        "ch": 4,
        "title": "Chapter 04: The Face, Body, and Health（五官、身體與健康）",
        "episode": "EP4《再晚一分鐘傷口就癒合了！全院陪葬與總裁的萬年胃病》",
        "mp3": "霸總Ch04_Health_總裁的重感冒與十倍苦藥.mp3",
        "turns": [
            ("narrator", "zh-TW-HsiaoYuNeural",
             "第四章：The Face, Body, and Health 身體與健康篇！這天半夜兩點，林小美在切水果時，不小心劃破了手指頭 finger，流出了一小滴紅紅的 blood 鮮血。顧總裁看到那一滴血，眼神瞬間變得無比心疼與瘋狂！"),
            ("ceo", "zh-TW-YunJheNeural",
             "傳御用醫生！快！我的女人受傷了，她的手指在流血，整張 face 臉蛋看起來這麼 pale 蒼白！要是治不好她手上的 wound 傷口，害她留下疤痕，我要你們整間醫院陪葬！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "私人醫院的張院長提著急救箱，連滾帶爬衝進豪宅，拿放大鏡檢查完之後擦汗說：顧少息怒！少夫人身體非常 healthy 健康，手指頭這個小刮傷……老實說，您要是再晚一分鐘送過來，傷口就要自己 recover 癒合康復啦！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "噗，總裁你也太誇張了吧！我的手早就已經不 hurt 不痛了！反而是你，為了幫我買消夜淋了一整晚的雨，我用手 touch 摸一下你的額頭……天啊，燙成這樣，你發高燒 fever 了！而且還一直 cough 咳嗽，喉嚨 throat 一定很痛對不對？"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "張院長驚呼：糟了！顧少這是淋雨受寒引發的重感冒 cold，加上顧少有萬年老毛病，只要工作 pressure 壓力太大、飲食 diet 不正常，就會引發急性 stomachache 胃痛跟偏頭痛 headache！現在顧少全身虛弱 weak，連頭都 dizzy 暈眩站不穩了！"),
            ("ceo", "zh-TW-YunJheNeural",
             "都怪這個該死的女人……把我的 heart 心臟都偷走了，害我連生病都只想靠在妳的 shoulder 肩膀上 rest 休息。Wait……小美，妳手裡端的那碗黑黑的東西是什麼？"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "這是張院長剛開的退燒胃藥 medicine 啊！來，乖乖把嘴巴 mouth 張開吞下去！"),
            ("ceo", "zh-TW-YunJheNeural",
             "本總裁不要吃！我用 nose 鼻子一聞這個 smell 氣味，就知道這藥苦得要命，我的 tongue 舌頭對苦味過敏！除非……妳戴上 mask 口罩防止被我傳染之後，答應病好陪我一起做 exercise 運動，還要餵我吃一顆草莓糖，否則誰來勸我都沒用！"),
        ]
    },
    {
        "ch": 5,
        "title": "Chapter 05: Family（家庭、婚姻與親職保護）",
        "episode": "EP5《這張黑卡沒有密碼隨便刷！天才萌娃助攻與十億求婚》",
        "mp3": "霸總Ch05_Family_見家長與調皮小姪子.mp3",
        "turns": [
            ("narrator", "zh-TW-HsiaoYuNeural",
             "第五章：Family 家庭與婚姻篇！今天林小美帶著顧總裁回娘家參加 family 家族聚會。小美家的勢利眼 relative 親戚們不知道顧辰的真實身分，一看到他們進門就開始冷嘲熱諷。"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "顧辰別理他們，我先幫你介紹長輩：坐在主位最慈祥的是我爺爺 grandfather 跟奶奶 grandmother；旁邊翹著二郎腿炫富的，是我叔叔 uncle、嬸嬸 aunt，還有一直追求不到我的表哥 cousin。"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "這時，一個五歲的小男孩跟綁雙馬尾的小女孩突然衝進客廳，一把抱住林小美的大腿奶聲奶氣地大喊：漂亮阿姨！我們終於找到妳了！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "哇，這兩個小朋友長得好 cute 可愛喔！顧辰，他們是誰啊？"),
            ("ceo", "zh-TW-YunJheNeural",
             "咳，這個最 naughty 調皮搗蛋、專門在集團製造 trouble 麻煩的小鬼，是我姊姊的兒子，也就是我的外甥 nephew；旁邊乖巧的小女孩則是我的外甥女 niece。今天家裡的保姆 baby sitter 請假，這兩個小傢伙就吵著要跟來見未來的舅媽！"),
            ("kevin", "zh-TW-HsiaoYuNeural",
             "小外甥立刻挺起小胸膛對全場親戚大聲爆料：你們不准欺負我未來舅媽！我舅舅為了 protect 保護她的 safety 安全，不讓任何危險的 stranger 陌生人靠近她，也不讓她遇到半點 danger 危險，已經把這整棟豪宅買下來寫在她名下，給你們全家人最頂級的 support 支持與照顧 care 啦！"),
            ("ceo", "zh-TW-YunJheNeural",
             "沒錯！各位長輩，還有小美的爸媽 parent，今天我是以最正式 formal 的身分來提親的。這張無限黑卡沒有密碼，裡面有十個億，拿去隨便刷，花不完今晚不准回家！"),
            ("xiaomei", "zh-TW-HsiaoChenNeural",
             "天啊，十個億的黑卡說刷就刷？！顧辰，那我結束 single 單身生活之後，該不會每天都要幫你算錢吧？"),
            ("ceo", "zh-TW-YunJheNeural",
             "全天下所有的好東西都該屬於我，包括妳在內！小美，成為我一輩子的人生 partner 伴侶，跟本總裁變成全世界最讓人羨慕的 couple 夫妻吧！現在就跟我去登記 marry 結婚，讓我當妳唯一的 husband 丈夫，我們一起 together 共度未來的幸福 life 人生，不准拒絕我！"),
            ("narrator", "zh-TW-HsiaoYuNeural",
             "在老管家與小萌娃的歡呼聲中，五集霸總短劇圓滿落幕！恭喜大家，一邊看狗血爽劇，一邊把前五章的核心英文單字全部記熟了！"),
        ]
    }
]

async def synth_chapter(ch_obj):
    mp3_path = os.path.join(BASE_DIR, ch_obj["mp3"])
    temp_files = []
    for idx, (role, voice, text) in enumerate(ch_obj["turns"]):
        temp_path = os.path.join(BASE_DIR, f"_chv2_{ch_obj['ch']}_{idx:02d}.mp3")
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, voice)
                await comm.save(temp_path)
                temp_files.append(temp_path)
                break
            except Exception:
                await asyncio.sleep(0.8)
    with open(mp3_path, "wb") as out:
        for tf in temp_files:
            if os.path.exists(tf):
                with open(tf, "rb") as f:
                    out.write(f.read())
                os.remove(tf)
    print(f"Viral Chapter {ch_obj['ch']} MP3 Done: {ch_obj['mp3']} ({os.path.getsize(mp3_path)/1024:.1f} KB)", flush=True)

async def main():
    for ch_obj in CHAPTERS:
        await synth_chapter(ch_obj)
    print("ALL 5 VIRAL SHORT-DRAMA CHAPTERS COMPLETED!", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
