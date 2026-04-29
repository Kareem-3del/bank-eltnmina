const REPORT_NAME="ARBAR23EN"
const INDEX_LOCATION=new URL('../../index.html',import.meta.url).pathname
const CURRENT_URL=window.location.pathname
export const ROOT=INDEX_LOCATION.replace('index.html','')
const CURRENT_PAGE=CURRENT_URL.replace(ROOT,'')
const JSON_PATH=ROOT+"assets/js/structure.json"
const SEARCH_INDEX=ROOT+"assets/js/search_index.json"
let structure
let allPages=[]
$.ajax({async:!1,type:'GET',url:JSON_PATH,success:function(data){structure=data}})
function expand(pageArray){for(let page of pageArray){if(page.slug!="#"){allPages.push(page)}
if(page.children){expand(page.children)}}}
expand(structure)
function nextPrevPages(){let lastIndex=allPages.length-1
let next=!1
let prev=!1
for(let[index,page]of allPages.entries()){let slug=`${page.slug}`
if(slug==CURRENT_PAGE&&index+1<=lastIndex){next=allPages[index+1]}
if(slug==CURRENT_PAGE&&index-1>=0){prev=allPages[index-1]}}
let nextElement=$("#nextlink")
let prevElement=$("#prevlink")
if(next!=!1){let nextPath=ROOT+next.slug
nextElement.find('span').text(next.name)
nextElement.attr('href',nextPath)}else{nextElement.remove()}
if(prev!=!1){let prevPath=ROOT+prev.slug
prevElement.find('span').text(prev.name)
prevElement.attr('href',prevPath)}else{prevElement.remove()}}
function downloadPdf(page,setUrl,lang){let paths=page.split('/')
let path=paths[paths.length-1]
let pdfUrl=ROOT+`services/pdf/${path}`
pdfUrl=pdfUrl.replace(".html",".pdf")
if(setUrl){let pdfElement=$("#download-pdf")
pdfElement.attr('href',pdfUrl)}
if(lang){let currentLang=ROOT.includes('/ar')?"ar":"en"
if(lang=="en"){if(currentLang=="ar"){pdfUrl=pdfUrl.replace('/ar','')}}
if(lang=="ar"){if(currentLang=="en"){pdfUrl=pdfUrl.replace('/services','/ar/services')}}}
return pdfUrl}
function addMyReport(elem){let currentPage
if(elem){let parentElem=elem.closest(".menus")
currentPage=parentElem.attr("slug")}else{currentPage=CURRENT_PAGE}
if(!checkMyReport(currentPage)){let pageToAdd
for(let page of allPages){let slug=`${page.slug}`
let currentLang=ROOT.includes('/ar')?"ar":"en"
if(currentPage==slug){pageToAdd=page
pageToAdd.lang=currentLang
break}}
if(pageToAdd){let myReport=[]
if(localStorage.getItem(REPORT_NAME)!=null){myReport=JSON.parse(localStorage.getItem(REPORT_NAME))}
myReport.push(pageToAdd)
localStorage.setItem(REPORT_NAME,JSON.stringify(myReport))
checkMyReport(currentPage)
renderMyReport()
alert("تمت الإضافة بنجاح إلى تقريري")}else{alert("لا يمكن إضافة هذه الصفحة إلى تقريري")}}else{alert("تمت الإضافة إلى تقريري مسبقًا")}}
function removeMyReport(elem){let reportId=elem.attr('id')
let myReport=JSON.parse(localStorage.getItem(REPORT_NAME))
myReport.splice(reportId,1)
localStorage.setItem(REPORT_NAME,JSON.stringify(myReport))
renderMyReport()}
function checkMyReport(pageToAdd){if(pageToAdd.charAt(0)==='/'){pageToAdd=pageToAdd.substring(1)}
let myReport=[]
if(localStorage.getItem(REPORT_NAME)!=null){myReport=JSON.parse(localStorage.getItem(REPORT_NAME))}
let currentLang=ROOT.includes('/ar')?"ar":"en"
for(let page of myReport){if(page.slug==pageToAdd&&page.lang==currentLang){$("#add-to-report").addClass("added")
return!0}}
return!1}
function renderMyReport(){$(".tt-sliding-cart-product-list").empty()
let myReport=[]
if(localStorage.getItem(REPORT_NAME)!=null){myReport=JSON.parse(localStorage.getItem(REPORT_NAME))}
if(myReport.length>0){let html=''
for(let[index,report]of myReport.entries()){let pdfUrl=downloadPdf(report.slug,!1,report.lang)
html+=`
            <li>
                <div class="tt-sliding-cart-product">
                    <img src="${ROOT}assets/images/pdf_icon.svg" alt="image">
            
                    <div class="tt-sc-product-info col-8">
                        <h2>${report.name}</h2>
                    </div>
            
                    <div class="d-flex align-items-center col-4">
                        <div class="m-2">
                            <a href="${pdfUrl}" target="_blank" class="btn btn-outline-dark btn-sm"
                                data-toggle="tooltip" data-placement="top" aria-label="Download" data-bs-original-title="Download"
                                aria-describedby=""><i class="fa fa-download"></i></a>
                        </div>
            
                        <div class="m-2">
                            <a href="#" id="${index}" class="remove-from-report btn btn-outline-dark btn-sm" data-toggle="tooltip" data-placement="top"
                                aria-label="Remove" data-bs-original-title="Remove" aria-describedby=""><i
                                    class="fa fa-trash"></i></a>
                        </div>
                    </div>
                </div>
            </li>
            `}
$(".tt-sliding-cart-product-list").append(html)
$(".my-report .empty-my-report").hide()
$('.tt-sliding-cart-trigger-count').show()
$('.tt-sliding-cart-trigger-count').text(myReport.length)
$(".download-full-pdf").show()
downloadMyReport()}else{$('.tt-sliding-cart-trigger-count').hide()
$(".download-full-pdf").hide()
$(".my-report .empty-my-report").show()}}
function downloadMyReport(){let myReportConfig={pdfPath:'../services/pdf/',reportName:REPORT_NAME}
async function getBlob(fileURL){let response=await fetch(fileURL)
let file=await response.blob()
return file}
async function readFileAsync(file){let blob=await getBlob(file)
return new Promise((resolve,reject)=>{let reader=new FileReader()
reader.onload=()=>{resolve(reader.result)}
reader.onerror=reject
reader.readAsArrayBuffer(blob)})}
function download(file,filename,type){let link=$('#dwnid')
let binaryData=[]
binaryData.push(file)
link.href=URL.createObjectURL(new Blob(binaryData,{type:type}))
link.attr("href",link.href)
link.attr("download",filename)}
async function merge(urls){let PDFDocument=PDFLib.PDFDocument
const mergedPdf=await PDFDocument.create()
for(let url of urls){let pdfUrl=downloadPdf(url.slug)
let bytes=await readFileAsync(pdfUrl)
const pdf=await PDFDocument.load(bytes)
const copiedPages=await mergedPdf.copyPages(pdf,pdf.getPageIndices())
copiedPages.forEach((page)=>mergedPdf.addPage(page))}
const mergedPdfFile=await mergedPdf.save()
download(mergedPdfFile,myReportConfig.reportName+' - My Report.pdf','application/pdf')}
function generateDownloadLink(){let files=JSON.parse(localStorage.getItem(myReportConfig.reportName))
let sorted=files.sort((a,b)=>a.Rid-b.Rid)
merge(sorted)}
generateDownloadLink()}
function downloadCenter(){let pages=$('.download-manager .download-manager-acc .menus')
for(let page of pages){let pageName=removeChars($(page).find("h3").text())
let details=allPages.find(({name})=>removeChars(name)===pageName)
let pdfUrl=downloadPdf(details.slug)
$(page).find("a").attr("href",pdfUrl)
$(page).find(".pdfsize").text(details.pdfsize)
$(page).attr("slug",details.slug)}}
function searchReport(search){if(search){$('#search-report').val(search)}else{search=$('#search-report').val()}
search=search.toLowerCase()
let searchIndex
$.ajax({async:!1,type:'GET',url:SEARCH_INDEX,success:function(data){searchIndex=data}})
for(let page of searchIndex){let content=page.content
let contentLowerCase=content.toLowerCase()
let indexOfTerm=contentLowerCase.indexOf(search)
if(indexOfTerm!==-1){$('.search-container .no-results').hide()
let startOfWord=contentLowerCase.lastIndexOf(' ',indexOfTerm)+1
let endOfWord=contentLowerCase.indexOf(' ',indexOfTerm)
let targetWord=content.slice(startOfWord,endOfWord!==-1?endOfWord:undefined)
let wordsBefore=content.slice(0,startOfWord).trim().split(' ').slice(-3).join(' ');let wordsAfter=content.slice(endOfWord!==-1?endOfWord:startOfWord).trim().split(' ').slice(0,32-wordsBefore.split(' ').length-targetWord.split(' ').length).join(' ');let result=`${wordsBefore} ${targetWord} ${wordsAfter}...`
let excerpt=markWords(result,search)
page.excerpt=excerpt
let resulttag=`
            <a class="result" href="${ROOT}${page.slug}?k=${search}">
                <h4>${page.name}</h4>
                <p>${page.excerpt}</p>
            </a>
            `
$('.search-result').append(resulttag)}}}
function langChange(){let currentLang=ROOT.includes('/ar')?"ar":"en"
let langChangeLink=""
if(currentLang=="en"){langChangeLink=ROOT+"ar/"+CURRENT_PAGE}
if(currentLang=="ar"){let newRoot=ROOT.replace("/ar/","/")
langChangeLink=newRoot+CURRENT_PAGE}
$('.lang-links > a').attr('href',langChangeLink)}
function highlightCurrent(){let filename=CURRENT_URL.substr(CURRENT_URL.lastIndexOf('/')+1)
$('.tt-ol-menu-list a').filter(function(){return $(this).attr('href')==filename&&filename!='index.html'}).parent().addClass('current-link').closest('.tt-ol-submenu-wrap').addClass('opened').parent().closest('.tt-ol-submenu-wrap').addClass('opened')}
function removeChars(text){let formattedText=text.replace(/[^\w\s\u0600-\u06FF]/gi,'').replace(/\s+/g,'').toLowerCase()
return formattedText}
function markWords(text,search){let regex=new RegExp(`(?:(?<=^|[^\\p{L}0-9_])|(?=[^\\p{L}0-9_]|$))\\w*${search}\\w*`,'giu')
let formattedText=text.replace(regex,function(match){return'<mark>'+match+'</mark>'})
return formattedText}
nextPrevPages()
highlightCurrent()
langChange()
downloadPdf(CURRENT_PAGE,!0)
if($(".my-report").length){renderMyReport()}
if($(".download-manager").length){downloadCenter()}
$("#addmrepicn").on('click',function(){addMyReport()
renderMyReport()})
$('.download-manager').on('click','.addmyreport',function(){addMyReport($(this))
renderMyReport()})
$('.my-report').on('click','.remove-from-report',function(){removeMyReport($(this))
renderMyReport()})
$(".pdp").on('click',function(){window.print()})
if($("#search-report").length){let params=new URLSearchParams(document.location.search)
let search=params.get("s")
if(search){searchReport(search)}}
let params=new URLSearchParams(document.location.search)
let searchKeyword=params.get("k")
if(searchKeyword){let instance=new Mark("#page-content")
instance.mark(searchKeyword)}
const defaultMenuImage=ROOT+$('.tt-ol-theme-image img').attr('data-src')
const defaultMenuText=$('.tt-ol-theme-image p').text()
gsap.set(".tt-ol-theme-image",{y:"-50%",opacity:1});function animateMenuImage(menuCurrentImage,menuCurrentText){let changeImageAnim=gsap.timeline()
changeImageAnim.to('.tt-ol-theme-image',{opacity:0,scale:0.9,duration:0.2,onComplete:changeImage,onCompleteParams:[menuCurrentImage,menuCurrentText]})
changeImageAnim.to('.tt-ol-theme-image',{opacity:1,scale:1,y:"-50%",duration:1,ease:"power4.out"})
function changeImage(imageSrc,text){$('.tt-ol-theme-image img').attr('src',imageSrc)
$('.tt-ol-theme-image p').text(text)}}
$('.tt-ol-menu-content .tt-ol-menu-list > li > a, .tt-ol-menu-content .tt-ol-menu-list > li > .tt-ol-submenu-trigger').on('mouseenter',function(){if(!$(this).hasClass('tt-ol-submenu-open')){let menuCurrentImage=ROOT+$(this).attr('img-src')
let menuCurrentText=$(this).attr('data-text')
animateMenuImage(menuCurrentImage,menuCurrentText)}})
$('.tt-ol-menu-content .tt-ol-menu-list > li > a, .tt-ol-menu-content .tt-ol-menu-list > li > .tt-ol-submenu-trigger').on('mouseleave',function(){let menuCurrentImage=""
let menuCurrentText=""
if($('nav.tt-overlay-menu .tt-ol-menu-list .tt-ol-submenu-trigger.tt-ol-submenu-open').length){menuCurrentImage=ROOT+$('.tt-ol-submenu-open').attr('img-src')
menuCurrentText=$('.tt-ol-submenu-open').attr('data-text')}else{menuCurrentImage=defaultMenuImage
menuCurrentText=defaultMenuText}
animateMenuImage(menuCurrentImage,menuCurrentText)})