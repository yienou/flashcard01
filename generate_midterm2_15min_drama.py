import asyncio
import edge_tts
import os

BASE_DIR = os.path.dirname(__file__)
OUTPUT_MP3 = os.path.join(BASE_DIR, "台北市國一翰林版二段總複習_霸總的十五分鐘滿分特訓.mp3")

# 台北市國一（115學年度翰林版七上）第二次段考（Unit 3 & Unit 4）15分鐘完整六幕廣播劇
# 100% 對應 eng_course 官方教材（U3 單字34個 + U4 單字35個 + 文法PPT + 文法加油站 + 文法宅急通）
# 角色：
# - narrator / butler (老管家李叔): zh-TW-HsiaoYuNeural
# - ceo (顧辰少爺): zh-TW-YunJheNeural
# - xiaomei (林小美): zh-TW-HsiaoChenNeural

ACTS = [
    # ==================== 第一幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "歡迎收聽：少爺別鬧了！台北市國一英文、一一五學年度翰林版第二次段考、十五分鐘滿分特訓短劇！第一幕：總裁的鐵血家規！祈使句、逗號陷阱與可分片語動詞！下禮拜就是台北市國中一年級的第二次段考了，為了讓未婚妻林小美考出一百分，身價千億的霸道總裁顧辰，直接把豪宅頂樓改造成特訓教室！"),
    ("zh-TW-YunJheNeural",
     "女人，妳成功引起我的注意了！但身為我顧辰未來的少夫人，英文段考要是沒考滿分，傳出去我還要不要面子？從現在開始，這間特訓 class 班級就是妳的戰場！在課堂上 in class 妳只能專心聽講，要等到 after class 下課後才能休息！桌上有我親自擬定的十條鐵血 rule，每一條規定妳都必須乖乖 follow 遵守，誰要是敢 break the rules 違反規定，就別怪本總裁無情！"),
    ("zh-TW-HsiaoChenNeural",
     "顧辰你很誇張耶！不過就是考個翰林版第三課跟第四課，你幹嘛把家裡搞得像軍事基地一樣啦？而且你看你門上貼的那張告示牌 sign，上面的英文根本就寫錯了！"),
    ("zh-TW-YunJheNeural",
     "胡說！本總裁留學歸國，怎麼可能寫錯？我為了命令李叔把門打開，在牌子上寫著：Li opens the door，還有叫妳保持安靜，我寫了一個大大的 Quiet！這哪裡錯了？"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔推了推眼鏡，尷尬地咳了一聲：報告少爺，少夫人說得對！段考第一大陷阱就是那個『逗號』！如果您寫 Li opens the door，中間沒有逗號，那叫做直述句，意思是『李叔平常會打開門』；但如果您是當面下命令：『李叔，去把門打開！』人名後面一定要點一個逗號，而且當面命令別人是祈使句，省略了主詞 you，動詞必須打回原形，要寫成『Li 逗號 open the door』才對啊！"),
    ("zh-TW-HsiaoChenNeural",
     "還有你寫的那個 quiet，它只是形容詞『安靜的』，不能單獨當祈使句啦！祈使句一定要用原形動詞開頭，所以前面要補上原形的 Be 動詞，說成 Be quiet，請保持安靜！同理，叫別人小心一點，因為 careful 也是形容詞『小心的』，前面一樣要加 Be，像是叫你小心那隻大狗，就要說 Be careful with that big dog，這樣才 safe 安全、段考才不會被扣分啦！"),
    ("zh-TW-YunJheNeural",
     "咳咳，本總裁當然知道！我只是故意少寫一個 Be，考考妳有沒有細心！那如果本總裁想展現紳士風度，在命令句裡面加上 please『請』跟妳的名字 Xiaomei，寫成 Please, Xiaomei sit down，總行了吧？"),
    ("zh-TW-HsiaoChenNeural",
     "還是錯！我們課本的文法加油站特別警告過：please 跟人名一起出現的時候，有三種正確寫法：第一種是人名放最前面加逗號，Xiaomei 逗號 please sit down；第二種是 Please sit down 逗號 Xiaomei；第三種是把 please 放句尾加逗號，Xiaomei 逗號 sit down 逗號 please！千萬不能把 please 跟人名直接黏在一起不加逗號！對了，please 除了當『請』，當動詞還有『取悅、討好』的意思喔，難怪人家常說 You can't please everybody，你不可能討好每個人！"),
    ("zh-TW-YunJheNeural",
     "哼，本總裁不需要討好別人，我只要討好妳就夠了！現在換本總裁用『否定祈使句』下達禁令！聽好了，否定祈使句就是在原形動詞前面加上 Don't！第一，上課時 Don't talk to me，不准跟我聊天，想找我 have a talk 談談要等下課；第二，遇到不會的題目 Don't fight，不准跟老管家吵架打架；第三，特訓室裡絕對不准吃東西跟喝飲料，Don't eat and drink here！第四，手機立刻給我關掉，Turn off it！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔嚇得雙膝一軟，連忙撲過來大喊：少爺使不得啊！您剛剛最後兩句話，一口氣踩中了兩個台北市段考最愛考的致命陷阱啊！"),
    ("zh-TW-HsiaoChenNeural",
     "哈哈哈，顧辰你快拿筆記本出來抄啦！第一個陷阱：在『否定句』裡面，要表達『不准吃東西、也不准喝飲料』，連接兩個被否定的動作，絕對不能用 and，一定要改用 or！所以要說 Don't eat or drink here，還有不准在牆上寫字或畫畫，也是說 Don't write or draw on the wall！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家接著翻開題庫：至於少爺踩中的第二個陷阱，是一一二年會考剛考過的『可分片語動詞』！像是關掉電器 turn off、打開電器 turn on，還有叫醒某人 wake up，如果受詞是一般名詞，放中間或放後面都可以；但如果受詞是代名詞 it、him、her、them，代名詞就『只能夾在正中間』！所以把手機關掉，一定要說 turn it off，叫醒他一定要說 wake him up，要是寫成 turn off it，段考直接飛掉兩分啊！"),
    ("zh-TW-YunJheNeural",
     "好啊，連李叔都敢聯合起來吐槽我了！那這箱段考考卷太重了，李叔，快過來 give me a hand！女人，妳知道 give me a hand 是什麼意思嗎？"),
    ("zh-TW-HsiaoChenNeural",
     "少看不起人了，hand 是手，飯前要先 wash your hands 洗手；而 give me a hand 可不是把你的手切下來給我，是指『幫我一個忙』啦！搬完考卷之後，It's your turn，輪到你去幫我泡杯熱可可了，快去！"),

    # ==================== 第二幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "第二幕：打開科博館的魔法門！Let's 提議與助動詞 can 的一字多義！特訓到了晚上十點，小美讀書讀得有點累了。這時，顧少爺神祕兮兮地從書架後面轉出一個暗門開關。"),
    ("zh-TW-YunJheNeural",
     "女人，看妳讀得這麼認真，本總裁決定在 my place 我家裡面，帶妳去一個神祕的好地方！妳看走廊盡頭那扇閃著紫光的 magic 魔法門，門後面就是本總裁私人包下的 science museum 科學博物館！Let's open the door，咱們一起打開門進去探險吧！"),
    ("zh-TW-HsiaoChenNeural",
     "Oh my！天哪，你居然把整座科博館搬進你家？Why not？為什麼不呢！這主意聽起來超棒 Sounds great，我已經等不及了 I can't wait！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔慌慌張張地跑過來攔住兩人：少爺、少夫人，Wait a second，請等一下啊！用 Let's 加原形動詞是提議『咱們一起做某事』，剛剛少夫人回答的 Why not、Sounds great、還有 Sure 都是『同意提議』的滿分回答；但如果我要勸你們『咱們千萬別進去』，否定句要把 not 直接放在 Let's 後面，說成 Let's not go in！因為裡面正在測試最新的魔術機關，連椅子都不准亂坐，Let's not sit on the chair，我們還是下次再去 Next time 吧！"),
    ("zh-TW-YunJheNeural",
     "李叔你太膽小了！本總裁可是練過魔術的人，I can do magic，我會變魔術，而且我還會保護小美！女人，Can you see that box？妳看得見前面桌上的那個箱子嗎？"),
    ("zh-TW-HsiaoChenNeural",
     "Are you sure？你確定你會變魔術？That's for sure 才怪咧！我看你只是想偷吃桌上那個鐵罐子裡面的餅乾吧！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔眼睛一亮：少夫人太敏銳了！這裡正好考到第三課超重要的一字多義：can 當助動詞的時候，後面一定要接『原形動詞』，用來表達能力『會、能夠』、或是請求許可『可以』，像是 Can I have a cookie？我可以吃塊餅乾嗎？但是當 can 變成名詞的時候，意思竟然是『罐子、鐵罐』！像是把餅乾放進罐子裡，就是 put some cookies in the can！"),
    ("zh-TW-HsiaoChenNeural",
     "不只 can 有一字多義，剛剛顧辰講的 place 也有三個意思喔！當名詞除了指『地方』，口語說 at my place 就是指『在我家』；而且 place 還可以當動詞，意思是『放置、擺放』，例如把椅子擺在桌子旁邊，就是 place the chair next to the table！"),
    ("zh-TW-YunJheNeural",
     "不愧是本總裁的女人，連一字多義都難不倒妳！我們要 make good use of 好好利用這間博物館的設備，拿桌上的鉛筆 write with a pencil 寫下通關密碼。糟了，博物館的定時警報響了，Hurry up！動作快點，我們現在處於匆忙之中 in a hurry，沒時間了 We don't have time，快跟著我 Follow me 跑出去！"),
    ("zh-TW-HsiaoChenNeural",
     "哈哈哈，雖然最後被警報追著跑，但我們在博物館裡面還是玩得很開心 have a good time！原來 time 當『時間』的時候不可數，但說 have a good time 玩得開心、或是計算『幾次』的時候，前面就可以加 a 或是變複數耶！"),

    # ==================== 第三幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "第三幕：公園吃醋大作戰！人稱代名詞受格與 see、look at、watch 大對決！隔天下午，小美為了透透氣，來到豪宅外面的公園散步 take a walk。這時，草地上有許多 many 人們正圍著一個年輕帥氣的 guy 傢伙。顧少爺拿著望遠鏡從陽台看到這一幕，醋罈子瞬間打翻，帶著十個保鑣衝進公園！"),
    ("zh-TW-YunJheNeural",
     "大膽！站在大石頭旁邊的那個 man 男人是誰？女人，我看到妳一直盯著他看，You look at he！而且妳居然還想過去跟他一起唱歌，sing with he？！天涼了，馬上讓那個小子的家族企業破產！"),
    ("zh-TW-HsiaoChenNeural",
     "等一下啦大醋桶！在讓別人破產之前，你的英文文法已經先破產了！什麼叫做 look at he 跟 sing with he？我們老師說過，動詞跟介系詞後面，絕對不能放主格，一定要放『受格』啦！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔立刻翻開第三課文法重點：報告少爺！少夫人說得一點都沒錯！當代名詞放在『一般動詞』或是『介系詞』（像是 at、with、for、to、in front of）後面當作對象時，必須全部換成『受格』！所以看著他，at 後面要放受格 him，說成 look at him；跟他一起唱歌，with 後面也要放受格 him，說成 sing with him！"),
    ("zh-TW-HsiaoChenNeural",
     "我幫大家把七個受格一次背齊：我 I 的受格是 me，你 you 的受格還是 you，他 he 的受格是 him，她 she 的受格是 her，它 it 的受格還是 it，我們 we 的受格是 us，他們 they 的受格則是 them！而且顧辰，你知道剛剛講到的『看』，英文有 see、look at 跟 watch 三種，段考超愛考它們的差別嗎？"),
    ("zh-TW-YunJheNeural",
     "這本總裁當然知道！如果你只是張開眼睛、自然而然『看見』某個結果，像是我在那裡看見瑪莉，要用 see；但如果是把視線轉過去『專注盯著看』，就要用 look at，或是用第四課的片語 take a look at 看一看！至於如果是花一段時間，盯著『會移動、會變化的畫面或比賽』，像是看電視、看球賽、或是在串流平台上看音樂影片，就要用 watch！"),
    ("zh-TW-HsiaoChenNeural",
     "算你厲害！那你用望遠鏡看清楚了嗎？草地上那些男人 men 根本不是我的相親對象，他們是現在最紅的搖滾樂團 rock band，正在公園裡拍攝最新的 music video 音樂影片！旁邊還有一隻超 cute 可愛的小狗坐在巨大的石頭 great rock 上面入鏡，大夥兒 guys 都在看他們拍片呢！"),
    ("zh-TW-YunJheNeural",
     "原來是拍 music video 音樂影片啊！說到這個，本總裁提醒妳：台灣人常把音樂影片簡稱叫 MV，但歐美外國人是不講 MV 的，一定要講完整的 music video！而且 band 這個字除了當『樂團』，還可以當手錶的『錶帶』喔，像本總裁這支百達翡麗名錶，就在找一條新的錶帶 a band for my watch！"),
    ("zh-TW-HsiaoChenNeural",
     "哇，原來 band 還可以當錶帶，great 除了當『很棒的』還可以當『巨大的』！那我考你一題第三課的 or 選擇疑問句：Are you a singer or a CEO？你是歌手還是總裁？你可以回答 Yes, I am 嗎？"),
    ("zh-TW-YunJheNeural",
     "當然不行！問句裡面只要有連接詞 or 讓你二選一，回答的時候『絕對不能用 Yes 或 No』，必須直接把答案選出來說：I am a CEO！"),

    # ==================== 第四幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "第四幕：包下整場演唱會！What day、What time 與 a.m.、p.m. 的致命陷阱！聽到小美喜歡那個搖滾樂團，寵妻無極限的顧少爺，立刻掏出手機撥給秘書！"),
    ("zh-TW-YunJheNeural",
     "喂，秘書嗎？把那個樂團這禮拜的整場 concert 演唱會給我包下來！女人，告訴我，Are you free this week？妳這禮拜哪一天有空，我們一起 together 去看演唱會！而且本總裁包場，門票全部免費，all the tickets are free，妳看 free 既能當『有空的』、又能當『免費的』跟『自由的』，多划算！"),
    ("zh-TW-HsiaoChenNeural",
     "真的嗎？可是這禮拜平日 on weekdays 我都要準備段考，行程超滿的耶！等一下，What day is today？今天是星期幾啊？"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔立刻搶答：少夫人，這題是第四課必考題！問『今天星期幾』要用 What day is today？或是 What day is it？回答的時候直接說 Today is Monday，或是 It is Monday，今天是星期一！千萬要記住：單純回答『今天是星期幾』的時候，星期幾的前面『絕對不能加介系詞 on』喔！"),
    ("zh-TW-HsiaoChenNeural",
     "對耶！那我算算看喔：今天星期一 Monday 我要背單字，明天星期二 Tuesday 我要算數學，星期三 Wednesday 我要寫考卷，星期四 Thursday 我要練聽力，星期五 Friday 學校要模擬考！每次背到星期二 Tuesday、星期三 Wednesday 跟星期四 Thursday，拼字都好容易搞混喔！"),
    ("zh-TW-YunJheNeural",
     "這有什麼難的？本總裁教妳霸總記憶法！星期二 Tuesday 開頭是 T-u-e，發音就像數字二 two，比出兩根手指就是星期二！星期三 Wednesday 最心機，拼法是 W-e-d-n-e-s-d-a-y，中間藏了一個不發音的字母 d！妳就想像本總裁跟妳在『星期三去結婚 wed』，中間那個 d 害羞躲起來不發音，保證一輩子不會漏寫！至於星期四 Thursday，開頭的 Thur 發音很像口渴 thirsty，連上四天課累到『口渴死 day』，就是星期四 Thursday 啦！"),
    ("zh-TW-HsiaoChenNeural",
     "哇，星期三結婚 wed 中間的 d 不發音、星期四口渴 Thursday，這樣記一秒就背起來了！既然我平日週一到週五都沒空，那到了 weekend 週末，也就是 Saturday 星期六跟 Sunday 星期日，我就 free 有空啦！那請問大總裁，What day is the concert？演唱會是在星期幾啊？"),
    ("zh-TW-YunJheNeural",
     "問『某個活動在星期幾』，回答的時候星期前面就要加介系詞 on 了！所以演唱會是在星期六，It's on Saturday！不過李叔，如果我把星期六前面加上一個『這個 this』，說演唱會是在『這個星期六』，是不是要說 It's on this Saturday 啊？"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔大喊：少爺千萬不可啊！這是第四課文法宅急通特別標註的星號陷阱：只要星期名稱的前面，出現了 this（這個）、next（下一個）、或是 every（每一個）這些字來修飾，前面就『絕對不能再加介系詞 on』！所以『這個星期六』直接說 this Saturday，『下星期一』直接說 next Monday，多寫一個 on 當場扣兩分！另外，如果要表達『每逢星期六』，還可以把星期六加上 s，說成 on Saturdays，就等於 every Saturday 喔！"),
    ("zh-TW-HsiaoChenNeural",
     "太重要了，這題我一定用紅筆畫三顆星！那確定了星期六，接下來要問『幾點幾分』：What time is the concert？演唱會是在幾點鐘啊？"),
    ("zh-TW-YunJheNeural",
     "哼，問現在幾點是 What time is it？或是 What is the time？回答直接講時間，像是三點零五分 It's three oh five，個位數的零可以唸成 oh，前面不用加介系詞；但妳現在問的是『演唱會在幾點』，回答某個活動在幾點，前面一定要加上介系詞 at！我看一下門票喔，演唱會是在下午兩點整，It's at two o'clock p.m. in the afternoon！"),
    ("zh-TW-HsiaoChenNeural",
     "噗哧！顧辰你又在亂講英文了！我們課本第四課特別強調：a.m.（中午前）跟 p.m.（中午十二點後），『絕對不能跟 o'clock 同時使用』，也『絕對不能跟 in the morning、in the afternoon 或 at night 重複連用』！你剛剛那句 two o'clock p.m. in the afternoon 把所有禁忌全部犯光光了啦！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔憋著笑點頭：少夫人太強了！這題就是段考選擇題最愛出的刪去法大魔王！要嘛就說 at two p.m.，要嘛就說 at two o'clock in the afternoon，兩邊絕對不能混搭！而且還要記住：正午十二點是 12 p.m.，半夜十二點則是 12 a.m. 喔！"),

    # ==================== 第五幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "第五幕：十億黑卡賭局！時間介系詞 at、on、in 與 study、movie、fan 的一字多義！被糾正了時間說法後，顧少爺不服氣地從西裝口袋掏出一張閃閃發光的無限黑卡，拍在書房桌上！"),
    ("zh-TW-YunJheNeural",
     "女人，既然妳這麼懂時間，這張黑卡沒有密碼，裡面有十個億！只要妳能闖過『時間介系詞 at、on、in 終極三關』，外加第四課的『一字多義大考驗』，這張黑卡就歸妳隨便刷！"),
    ("zh-TW-HsiaoChenNeural",
     "一言為定！本小姐這幾天夜以繼日 day and night 都在讀書，放馬過來吧！"),
    ("zh-TW-YunJheNeural",
     "第一關：時間介系詞 at、in、on 怎麼分？如果題目考『在星期日的早上 Sunday morning』跟『在星期五的夜晚 Friday night』，要用哪一個？"),
    ("zh-TW-HsiaoChenNeural",
     "太簡單了！我直接背黃金口訣給你聽：第一，確切的『幾點幾分』，還有正午 at noon、夜晚 at night、午夜 at midnight，全部用最小點的 at！第二，單純講早上 in the morning、下午 in the afternoon、傍晚 in the evening，全部用 in！第三，只要出現『星期幾』或是『特定某一天』（像是生日 on my birthday、週末 on the weekend），就算後面加上了早午晚，變成『星期日的早上 Sunday morning』或『星期五的晚上 Friday night』，因為已經指定了哪一天，就必須全部改用 on！所以是 on Sunday morning、on Friday night，絕對不能選 in！"),
    ("zh-TW-YunJheNeural",
     "居然一字不漏全對！那第二關考妳第四課的『一字多義』：妳現在正在我的房間裡讀英文，You are studying English in my study，後面在做一份恐龍的報告，doing a study on dinosaurs。請問這三個 study 分別是什麼意思？"),
    ("zh-TW-HsiaoChenNeural",
     "哈哈，你想用同一個字考倒我？第一個 studying English 的 study 是動詞『研讀、學習』；第二個 in my study，前面有所有格 my，當名詞是指豪宅裡的『書房』；第三個 doing a study on dinosaurs，前面有冠詞 a，當可數名詞是指『專題研究』！一個 study 同時學會『研讀、書房、研究』，我早就背起來了！"),
    ("zh-TW-YunJheNeural",
     "好，那再考妳：週末看完演唱會，我們去電影院看場電影，跟在家裡用平板看 Netflix 電影，動詞有什麼不一樣？還有，這裡太熱了，Turn off the fan，為什麼電扇跟粉絲都叫做 fan？"),
    ("zh-TW-HsiaoChenNeural",
     "這也是我們單字 PPT 上的重點！去電影院看電影，常搭配動詞 see，說 see a movie，或是直接說 go to the movies；如果是在家盯著電視或電腦螢幕看電影，就搭配 watch，說 watch a movie！至於 fan 這個字，當名詞本來是『扇子、電扇』，因為粉絲看到偶像都會熱情地像電扇一樣尖叫揮手，所以 fan 就變成『迷、粉絲』啦！顧大總裁，十億黑卡請交出來！"),

    # ==================== 第六幕 ====================
    ("zh-TW-HsiaoYuNeural",
     "第六幕：粉絲見面會後台直擊！現在進行式 V-ing 與 everyone、who 的單數大陷阱！轉眼來到了星期六，顧少爺不僅包下演唱會，還帶小美直通樂團的 meet-and-greet 粉絲見面會後台，並準備在結束後幫小美辦一場慶功 party 派對！小美已經完全 ready 準備好要見偶像了！"),
    ("zh-TW-HsiaoChenNeural",
     "哇，顧辰你看 Look！還有你仔細聽 Listen！這個樂團如今 these days 超受年輕人歡迎，The band is very popular with young people！你看那邊有電視台的記者 reporter，正在現場播報這場見面會，She is reporting on the meet-and-greet！剛好我下禮拜的英文報告 English report 就可以寫這個耶！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔立刻舉起段考最後衝刺牌：各位同學注意！只要看到句首有『Look! 看！』、『Listen! 聽！』或是句尾有『now / right now 現在』，就代表動作『正在進行中』，必須使用第四課最核心的『現在進行式：主詞 ＋ be 動詞（am / is / are）＋ 現在分詞 V-ing』！而且剛剛少夫人還講出了會考考過四次的超強片語：受到某人歡迎，介系詞一定要配 with，叫做 be popular with！播報某個新聞議題，介系詞則是配 on，叫做 report on！"),
    ("zh-TW-YunJheNeural",
     "哼，那個主唱哪有本總裁帥？不過現場氣氛真的很嗨，連整棟房子都在搖晃，The house is shaking！小美妳看，主唱現在正在跟粉絲們握手，He is shaking hands with his fans！大家在見面會上都好開心，Everyone are happy，而且每個人都正在邊聊天邊大笑，Everyone are talking and laughing！"),
    ("zh-TW-HsiaoChenNeural",
     "等一下！顧辰你剛剛那兩句話，前一句對、後一句又踩中段考大魔王陷阱了！先誇獎你前一句：跟別人『握手』因為是兩隻手握在一起，所以 shake hands 的 hands 一定要加 s 變複數；而且用連接詞 and 連接兩個現在分詞 talking and laughing，表示『正在邊聊天邊笑』，後面的 laughing 不用再重複寫 be 動詞。但是！你後面說 Everyone are happy 錯得離譜！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔激動地拍手：少夫人抓得好啊！第四課單字壓軸必考題：everyone（每個人，等於 everybody），雖然中文聽起來是很多人，但在英文文法裡，它永遠視為『第三人稱單數』！當主詞的時候，後面的動詞『一律只能用單數動詞 is』！所以每個人都很開心，一定要說 Everyone is happy；每個人都在讀書，或是用 every 加單數名詞 Every student，後面也一定要配 is studying，寫 are 絕對零分！"),
    ("zh-TW-YunJheNeural",
     "原來 everyone 永遠配單數 is 啊！那本總裁再考妳最後兩題現在進行式的陷阱題：第一題，那個小男孩正在寫作業、而不是在玩電動，英文怎麼說？第二題，如果我想問『現在是誰正坐在妳旁邊？』，已知坐妳旁邊的是妳爸媽兩個人喔，問句要用 Who is sitting next to you，還是 Who are sitting next to you？"),
    ("zh-TW-HsiaoChenNeural",
     "這兩題都是我們文法宅急通綜合演練的原題！第一題表達『正在做某事，而不是在做另一件事』，只要在第二個 V-ing 前面加上 not 就好，所以是 He is doing his homework, not playing a video game！而且記得：running 跑步、sitting 坐、swimming 游泳、cutting 切，這些短母音加子音的字都要『重複字尾再加 ing』；而像是 write、dance、make、take、use、have 這些字尾有不發音 e 的字，都要『去掉 e 再加 ing』！"),
    ("zh-TW-HsiaoChenNeural",
     "至於你問的第二題：『誰正坐在妳旁邊？』答案雖然是我爸媽兩個人，但在疑問句裡，當疑問詞 Who 直接當主詞的時候，一律視為『第三人稱單數』，所以永遠只能問 Who is sitting next to you？絕對不能用 Who are！"),
    ("zh-TW-YunJheNeural",
     "太神了！連 Who is sitting 的單數陷阱都瞞不過妳！走，既然都來到後台了，本總裁幫妳拍張照 take a picture！注意喔，拍某個東西的照片是用介系詞 of，像是拍那棵樹 take a picture of the tree；但如果是『跟偶像一起合照』，就要用介系詞 with，叫做 take a picture with the singer！拍完照之後，還可以請偶像在照片上幫妳簽名，Can you sign this picture for me？妳看，sign 在第三課當名詞是『標誌、告示』，到了第四課當動詞就變成『簽名』了！"),
    ("zh-TW-HsiaoYuNeural",
     "老管家李叔感動得熱淚盈眶：天啊！從第三課的祈使句、Let's 提議、助動詞 can、人稱代名詞受格，一路到第四課的星期與時間問答、a.m. 與 p.m. 禁忌、時間介系詞 at、on、in、現在進行式 V-ing，還有所有的一字多義，少爺跟少夫人居然在十五分鐘之內全部特訓完畢了！"),
    ("zh-TW-YunJheNeural",
     "那還用說？本總裁親自特訓的女人，下禮拜的台北市國一英文第二次段考，肯定橫掃千軍、拿下一百分滿分！祝全台北市國一的同學們，第二次段考通通滿分過關，我們下次見，See you next time！"),
]

async def main():
    temp_files = []
    print(f"Synthesizing {len(ACTS)} dramatic segments for the 115 Hanlin 15-minute midterm review...")
    for idx, (voice, text) in enumerate(ACTS):
        temp_path = os.path.join(BASE_DIR, f"_mid2_v2_{idx:02d}.mp3")
        for attempt in range(4):
            try:
                use_voice = "zh-CN-YunxiNeural" if voice == "zh-TW-YunJheNeural" else voice
                comm = edge_tts.Communicate(text, use_voice)
                await comm.save(temp_path)
                temp_files.append(temp_path)
                print(f"Segment {idx+1}/{len(ACTS)} OK ({use_voice})", flush=True)
                break
            except Exception as e:
                print(f"Retry {idx+1}: {e}", flush=True)
                await asyncio.sleep(0.8)
        await asyncio.sleep(0.1)
    
    raw_mp3 = os.path.join(BASE_DIR, "_raw_midterm2.mp3")
    with open(raw_mp3, "wb") as out:
        for tf in temp_files:
            if os.path.exists(tf):
                with open(tf, "rb") as f:
                    out.write(f.read())
                os.remove(tf)
    import subprocess, shutil
    en_mp3 = os.path.join(BASE_DIR, "taipei_g7_midterm2_drama.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_mp3,
        "-ar", "48000", "-ac", "2", "-b:a", "128k",
        "-metadata", "title=台北市國一翰林版二段總複習_霸總的十五分鐘滿分特訓",
        en_mp3
    ], check=True)
    shutil.copy2(en_mp3, OUTPUT_MP3)
    if os.path.exists(raw_mp3):
        os.remove(raw_mp3)
    size_mb = os.path.getsize(OUTPUT_MP3) / (1024 * 1024)
    print(f"115 HANLIN 15-MIN MIDTERM DRAMA DONE! File: {OUTPUT_MP3} ({size_mb:.2f} MB)", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
