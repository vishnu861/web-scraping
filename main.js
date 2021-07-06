const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const url = "https://github.com/topics";

request(url,cb);

function cb(err,res,html){
    if(err){
        console.log(err);
    }
    else{
        extracthtml(html);
    }
}

function extracthtml(html){
    let $ = cheerio.load(html);
    let ele = $(".no-underline.d-flex.flex-column.flex-justify-center");
    for(let i=0;i<ele.length;i++){
        let link = $(ele[i]).attr("href");
        let fulllink = "https://github.com"+link;
        repocallback(fulllink);
    }
}

function repocallback(fulllink){
    request(fulllink,function(err,res,html){
        if(err){
            console.log(err);
        }
        else{
            extractrepo(html);
        }
    })
}

function extractrepo(html){
    let $ = cheerio.load(html);
    let reponame = $(".h1").text().trim();
    let filepath = path.join(__dirname,reponame);
    dircreater(filepath);
    let repolinks = $(".tabnav.px-3.mb-0");
    let n = Math.min(8,repolinks.length);
    for(let i=0;i<n;i++){
        let issuesele = $(repolinks[i]).find(".tabnav-tab.f6.px-2.py-1");
        let issueslink = $(issuesele[1]).attr("href");
        let issuesfulllink = "https://github.com"+issueslink;
        let name = issuesfulllink.split("/")[4].trim();
        issuescallback(issuesfulllink,filepath,name);
    }
}

function issuescallback(link,filepath,name){
    request(link,function(err,res,html){
        if(err){
            console.log(err);
        }
        else{
            extractissues(html,filepath,name);
        }
    })
}

function extractissues(html,filepath,name){
    let $ = cheerio.load(html);
    let issuearr = $("a[data-hovercard-type='issue']");
    for(let i=0;i<issuearr.length;i++){
        let l = $(issuearr[i]).attr("href");
        l = "https://github.com"+l;
        let x = path.join(filepath,name+".json");
        let content =  jsonreader(x);
        content.push(l);
        jsonwriter(x,content);
    }
}


function dircreater(filepath){
    if(fs.existsSync(filepath)==false){
        fs.mkdirSync(filepath);
    }
}

function jsonreader(filepath){
    if(fs.existsSync(filepath)==false){
        return [];
    }
    let buffer = fs.readFileSync(filepath);
    let data= JSON.parse(buffer);
    return data;
}

function jsonwriter(filepath,data){
    let stringdata = JSON.stringify(data);
    fs.writeFileSync(filepath,stringdata);
}
