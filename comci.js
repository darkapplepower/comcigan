module.exports = function () {
    const Jsoup = org.jsoup.Jsoup;
    function getTimeTable(schoolId, grade, cl) {
        try {
            if (!isNaN(schoolId)) {
                const i = String(Jsoup
                    .connect("http://comci.net:4082/st")
                    
                    .get()
                    .select("script")
                    .get(1)
                    .html());
                const encodeText = String(new java.lang.String(android.util.Base64.encodeToString(new java.lang.String((scData(i) + schoolId + "_0_1").toString()).getBytes(),android.util.Base64.DEFAULT)));
                var data = String(Jsoup
                    .connect("http://comci.net:4082" + getUrl(i).split("?")[0] + "?" + encodeText)
                    .get()
                    .text());
                data = JSON.parse(data.replace(/\0/g, ""));
                const zaryo = getVariableName(i);
                const result = {};
                result.수업시간 = JSON.parse(JSON.stringify(data.일과시간));
                result.시간표 = [[], [], [], [], [], []];
                var ord, dad, th, sb, na, tt, ttt;
                for (let t = 1; t < 9; t++) {
                    for (let we = 1; we < 6; we++) {
                        ord = data[zaryo[0]][grade][cl][we][t];
                        dad = data[zaryo[1]][grade][cl][we][t];
                        if (dad > 100) {
                          th = data.분리 == 100 ? dad / data.분리|0 : dad % data.분리;
                          sb = data.분리 == 100 ? dad % data.분리 : dad / data.분리|0;
                          ttt = Math.floor(sb / data.분리);
                          tt = data.분리 == 100 ? '' : (ttt >= 1 && ttt <= 9) ? String.fromCharCode(ttt + 64) + "_" : '';
                          sb = sb % data.분리;
                            if (th < data[zaryo[3]].length) {
                                na = data[zaryo[4]][th].substr(0, 2);
                            } else {
                                na = "";
                            }
                            result.시간표[we - 1][t - 1] = (data[zaryo[5]][sb] + "(" + na + ")").toString();
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
            .connect(("http://comci.net:4082" + getUrl(String(Jsoup.connect("http://comci.net:4082/st").get().select("script").get(1).html())) + java.net.URLEncoder.encode(schoolName, "EUC-KR")).toString())
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
    };
}();