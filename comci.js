module.exports = function () {
    const Jsoup = org.jsoup.Jsoup;
    function getTimeTable(schoolId, grade, cl) {
        try {
            if (!isNaN(schoolId)) {
                const i = String(Jsoup
                    .connect("http://comci.kr:4082/st")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36")
                    .get()
                    .select("script")
                    .get(1)
                    .html());
                const encodeText = String(new java.lang.String(android.util.Base64.encodeToString(new java.lang.String((scData(i) + schoolId + "_0_1").toString()).getBytes(),android.util.Base64.DEFAULT)));
                var data = String(Jsoup
                    .connect("http://comci.kr:4082" + getUrl(i).split("?")[0] + "?" + encodeText)
                    .get()
                    .text());
                data = JSON.parse(data.replace(/\0/g, ""));
                const zaryo = getVariableName(i);
                const result = {};
                result.수업시간 = JSON.parse(JSON.stringify(data.일과시간));
                result.시간표 = [[], [], [], [], [], []];
                let ord, dad, th, sb, na;
                for (let t = 1; t < 9; t++) {
                    for (let we = 1; we < 7; we++) {
                        ord = data[zaryo[0]][grade][cl][we][t];
                        dad = data[zaryo[1]][grade][cl][we][t];
                        th = Math.floor(dad / 100);
                        sb = dad - th * 100;
                        if (dad > 100) {
                            if (th < data[zaryo[3]].length) {
                                na = data[zaryo[4]][th].substr(0, 2);
                            } else {
                                na = "";
                            }
                            result.시간표[we - 1][t - 1] = (data[zaryo[5]][sb] + "(" + na + ")").toString()
                        }
                    }
                }
                return result;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    function searchSchool(schoolName, isText) {
        var result = String(Jsoup
            .connect(("http://comci.kr:4082" + getUrl(String(Jsoup.connect("http://comci.kr:4082/st").header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36").get().select("script").get(1).html())) + java.net.URLEncoder.encode(schoolName, "EUC-KR")).toString())
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36")
            .header("Referer", "http://comci.kr:4082/st")
            .get()
            .text());
        result = JSON.parse(result.replace(/\0/g, ""));
        result = result["학교검색"].map(function (x) {
            return {
                name: (x[2] + "(" + x[1] + ")").toString(),
                value: x[3]
            };
        });
        if (isText) {
            return result.map(x => x.name + "|" + x.value).join("\n");
        }
        return result;
    }
    function getVariableName(i) {
        var result = new Array();
        let count;
        while (true) {
            count = i.indexOf("자료.자료");
            if (count === -1) {
                break;
            }
            result.push(i.substr(count + 3, 5));
            i = i.substring(count + 8);
        }
        return result;
    }
    function getUrl(i) {
        return i.substring(i.indexOf("url")).match(/\/([^\']+)/)[0];
    }
    function scData(i) {
        return i.substr(i.indexOf("sc_data('") + 8).match(/[^']+/)[0];
    }
    return {
        searchSchool: searchSchool.bind(),
        getTimeTable: getTimeTable.bind()
    }
}()
