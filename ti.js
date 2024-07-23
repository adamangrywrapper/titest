var forgeIconBaseUrl = https://forge.lseg.com/icons;
var globalSiteFooter = ".global-site-footer";
var LC_LAST_VISITED_REFERRER_COOKIE_NAME = "LC_LAST_VISITED_REFERRER";
var TI_INCORRECT_USER_FLOW_REDIRECT_URL_SLUG_PLACEHOLDER = "<SLUG-ID>";
var TI_INCORRECT_USER_FLOW_REDIRECT_GOTO_URL_PLACEHOLDER = "<GOTO-URL>";
var forgeRightArrowIcon = forgeIconBaseUrl + "/ui/blue/arrow-right.svg";
var TI_COURSE_DETAILS_SEARCH_URL = "/incoming/v2/content";
var findFigureExpandableInterval = null;
var isProdEnv = true;
 
var domElementDetector = (element, callback) => {
    const domElementDetectorTimeInterval = setInterval(() => {
        if (element && $(element).length > 0) {
            callback();
            clearInterval(domElementDetectorTimeInterval);
        }
    }, 100);
};
 
var forgeTickSvgIcon = `
    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink>
        <title>blue/tick</title>
        <defs>
            <polygon id="path-1" points="28.5848268 6.6 29.9990404 8.01421356 12.6042136 25.4090404 11.19 23.9948268 11.194 23.99 2 14.7966991 3.41421356 13.3824856 12.608 22.576"></polygon>
        </defs>
        <g id="blue/tick" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <mask id="mask-2" fill="white">
                <use xlink:href="#path-1"></use>
            </mask>
            <use id="Mask" fill="#fff" xlink:href="#path-1"></use>
        </g>
    </svg>
`;
 
var setCookieTI = (name, value, expDays = "") => {
    const exdate = new Date();
 
    exdate.setDate(exdate.getDate() + expDays);
 
    const cookieValue = escape(value) + " ; path=/" + ((expDays === null || expDays === "") ? "" : "; expires=" + exdate.toUTCString());
 
    document.cookie = name + "=" + cookieValue;
};
 
var getCookieTI = (name) => {
    const cookies = document.cookie.split(";");
    let cookieName = null;
 
    for (let count = 0; count < cookies.length; count++) {
        cookieName = cookies[count].substr(0, cookies[count].indexOf("="));
        cookieName = cookieName.replace(/^\s+|\s+$/g, "");
 
        if (cookieName === name) {
            const cookieIndex = cookies[count].substr(cookies[count].indexOf("=") + 1);
 
            return unescape(cookieIndex);
        }
    }
 
    return null;
};
 
var deleteCookieTI = (cookieName) => {
    document.cookie = cookieName + '=; path=/; expires=Thu, 01-Jan-70 00:00:01 GMT;';
};
 
var autoForceReloadPage = (pageIdentifier) => {
    if ($(pageIdentifier).length > 0) {
        const isTIPageReloaded = getCookieTI("isLearningPathTemplateReloaded");
        
        if (isTIPageReloaded) {
            deleteCookieTI("isLearningPathTemplateReloaded");
        } else {
            setCookieTI("isLearningPathTemplateReloaded", true);
            window.location.reload(true);
            
            return false;
        }
    }
};
 
async function getCourseDetails(slug_value) {
    let result = "";
    const bodyRequest = {
        query: "",
        page: {
            "current": 1,
            "size": 50
        },
        filters: {
            "external_url": slug_value
        }
    };
    const bodyRequestJSOn = JSON.stringify(bodyRequest);
 
    try {
        result = $.ajax({
            type: "POST",
            url: ELASTIC_SEARCH_URL,
            headers: {
                "Authorization": `Bearer ${ELASTIC_SEARCH_AUTHORIZATION_KEY}`,
            },
            contentType: "application/json; charset=utf-8",
            data: bodyRequestJSOn
        });
 
        return result;
    } catch (error) {
        console.error(error);
    }
};
 
var updateTICourseDetails = (slug_value = "", contentItem = "", elementContainer = null) => {
    // Update learning path or certificate template's headers title without manually changing into layout design
    
    try { 
               fetch(`${TI_COURSE_DETAILS_SEARCH_URL}?query=slug:${slug_value}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${TI_SEARCH_AUTHORIZATION_KEY}`,
            }
        }).then(response => response.json()).then((result) => {
            if (result && result.contentItems[0] && result.contentItems[0][contentItem]) {
                domElementDetector(elementContainer, () => {
                    $(elementContainer).text(result.contentItems[0][contentItem]);
                });
            }
        })
               } catch (error) {
        console.log("Update TI learning path or ceritifcate headers title error: " + error);
               }
};
 
async function getInternalTICourseDetails(slug_value) {
    let result = "";
    
    try {
        result = $.ajax({
            type: "GET",
            URL: `${TI_COURSE_DETAILS_SEARCH_URL}?query=slug:${slug_value}`,
            headers: {
                "Authorization": `Bearer ${TI_SEARCH_AUTHORIZATION_KEY}`,
            },
            contentType: "application/json; charset=utf-8",
        });
 
        return result;
    } catch (error) {
        console.error(error);
    }
};
 
/* Genarate video player */
var generateKalturaVideo = () => {
    const kalturaVideoItemContainer = $("body.learn").not(".manager").find(".kaltura-video-item");
    const kalturaVideoIdPath = kalturaVideoItemContainer.find(".entry-id");
 
    domElementDetector(kalturaVideoIdPath, () => {
        const kalturaVideoEntryId = $(kalturaVideoIdPath).text();
 
        if (kalturaVideoEntryId) {
            kalturaVideoItemContainer.html(`
                <div class="kaltura-player-container">
                    <div class="kaltura-outer">
                        <div class="kaltura-inner">
                            <div id="kaltura_player_${kalturaVideoEntryId}"></div>
                        </div>
                    </div>
                    <div id="transcript-player-plugin"></div>
                </div>
            `);
 
            try {
                kWidget.embed({
                    "targetId": "kaltura_player_" + kalturaVideoEntryId,
                    "wid": "_" + KALTURA_PARTNER_ID,
                    "uiconf_id": KALTURA_PLAYER_ID,
                    "flashvars": {
                        "ks": KALTURA_SESSION,
                        "localizationCode": "en",
                        "EmbedPlayer.WebKitPlaysInline": true,
                        "mobileAutoPlay": true
                    },
                    "entry_id": kalturaVideoEntryId
                });
            }
            catch (error) {
                window.location.reload(true);
            }
        }
    });
};
 
/* Common function to convert date to required format */
 
var convertedDate = (updatedOn) => {
    const date = new Date(updatedOn);
    const options = {year: 'numeric', month: 'long', day: '2-digit' };
    const convertDate = date.toLocaleDateString("en-US", options);
    
    return convertDate;
};
 
var setEnvironmentalVariable = () => {
    const hostname = window.document.location.hostname;
 
    if (hostname && (hostname.match(/\./g) || []).length > 2) {
        // e.g. learningcentre.lseg.com domain contains 2 dots that means it is prod environment.
        // e.g. uat.learningcentre.lseg.com domain contains 3 dots (or greater than 2) that means it is non-prod environment
        isProdEnv = false;
 
        if ($("body.pre-prod").length <= 0) {
            $("body").addClass("pre-prod");
        }
    } else {
        isProdEnv = true;
 
        if ($("body.prod").length <= 0) {
            $("body").addClass("prod");
        }
    }
};
 
var manageUserInterfaceDistorting = () => {
    if ($("body.manager").length <= 0) {
        const isUserInterfaceDistorted = false;
 
        $("body.learn, body.home").css("display", "none");
 
        $(globalSiteFooter).hide(); // Hide footer section during initial load to avoid showing footer at top
 
        setEnvironmentalVariable();
 
        setTimeout(() => {
            if (!isUserInterfaceDistorted) {
                $("body.learn, body.home").css("display", "flex");
            }
        }, 1500);
    }
};
 
var managerFigureExpandable = () => {
    clearInterval(findFigureExpandableInterval);
    findFigureExpandableInterval = setInterval(() => {
        const elementContainer = $("body.learn").not(".manager").find(".figure-expandable");
        domElementDetector(elementContainer, () => {
            const imagePath = $(elementContainer).attr("src");
 
            if (imagePath) {
                const figureExpandableButton = `
                    <figure class="Figure" data-expandable="true" data-rehydratable="Figure">
                        <div class="Figure-inner">
                            <div class="Figure-imageWrapper">
                                <div class="Image">
                                    <img class="Image-img" loading="lazy" alt="Alt attribute" src="${imagePath}" />
                                </div>
                            </div>
                            <button class="Figure-expandable" onClick="javascript: showExpandableImagePopup('${imagePath}');">
                                <svg class="Icon Icon--s" xmlns=https://www.w3.org/2000/svg viewBox="0 0 32 32" xmlns:xlink=https://www.w3.org/1999/xlink aria-hidden="true" focusable="false">
                                    <path fill="" d="M5.396 4L13 11.582 11.583 13 4 5.4V11H2V2h9v2H5.396zm21.208 0L19 11.582 20.417 13 28 5.4V11H30V2h-9v2h5.604zM5.396 28L13 20.418 11.583 19 4 26.6V21H2v9h9v-2H5.396zm21.208 0L19 20.418 20.417 19 28 26.6V21H30v9h-9v-2h5.604z"></path>
                                </svg>
                            </button>
                        </div>
                    </figure>
                `;
 
                $(elementContainer).replaceWith(figureExpandableButton);
 
                setTimeout(() => {
                    $("body.learn .Figure .Figure-inner .Figure-expandable").show();
                }, 500);
            }
        });
    }, 1000);
};
 
var showExpandableImagePopup = (imagePath = "") => {
    const expandableImageModalContainer = "expandable-image-modal-container";
    const expandableImageModalPopup = `
        <div class="${expandableImageModalContainer}">
            <div class="Modal">
                <div aria-modal="true" class="Modal-dialog" role="dialog">
                    <div class="Modal-header">
                        <div class="Modal-headerOuter">
                            <div class="Modal-headerInner">
                                <button aria-label="close" class="Modal-button" onClick="javascript: $('.${expandableImageModalContainer}').remove(); $('body').css('overflow-y', 'visible');">
                                    <span class="Modal-buttonClose">
                                        <img alt="Alt attribute" src="${forgeIconBaseUrl}/ui/grey/close-07.svg" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="Modal-content">
                        <div class="Modal-contentOuter">
                            <div class="Modal-contentInner">
                                <figure class="Figure">
                                    <div class="Figure-inner">
                                        <div class="Figure-imageWrapper">
                                            <div class="Image">
                                                <img
                                                    class="Image-img"
                                                    loading="lazy"
                                                    alt="Alt attribute"
                                                    src="${imagePath}"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
 
    $(`.${expandableImageModalContainer}`).remove();
    $("body").append(expandableImageModalPopup);
    $("body").css("overflow-y", "hidden");
};
 
var domElementContentChangeDetector = (targetNode, callback) => {
    const observer = new MutationObserver(callback);
    
    observer.observe(
        targetNode,
        {
            attributes: true, childList: true, subtree: true
        }
    );
};
 
var manageIncorrectLoginFlow = () => {
    if (window.AtlasSettings && !window.AtlasSettings.userId && !window.AtlasSettings.userEmail) {
        // user is not logged-in
 
        const loginFlowRedirection = (url = "", placeholder = "", slug = "") => {
            let redirectUrl = LC_HOME_PAGE_URL;
 
            if (url && placeholder && slug) {
                redirectUrl = url.replace(placeholder, slug);
            }
 
            window.location.href = redirectUrl;
        };
 
        try {
            const urlPathName = window.location.pathname;
            const urlPathNameArray = urlPathName.split('/');
            let courseSlugValue = urlPathNameArray[3];
 
            if (urlPathName.toLocaleLowerCase().includes("/courses/")) {
                courseSlugValue = urlPathNameArray[2];
            }
 
            if (courseSlugValue) {
                getCourseDetails(courseSlugValue).then((data) => {
                    const results = data.results;
 
                    if (results.length > 0) {
                        results.forEach((result) => {
                            const lcType = result.lc_type.raw;
                            const externalUrl = result.external_url.raw;
 
                            switch (lcType.toLowerCase()) {
                                case "class":
                                    loginFlowRedirection(LC_COURSE_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_URL_SLUG_PLACEHOLDER, externalUrl);
                                    break;
                                case "playlist":
                                case "video":
                                    loginFlowRedirection(LC_VIDEO_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_URL_SLUG_PLACEHOLDER, externalUrl);
                                    break;
                                case "document":
                                    loginFlowRedirection(LC_DOCUMENT_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_URL_SLUG_PLACEHOLDER, externalUrl);
                                    break;
                                default:
                                    // redirect to event-details page
                                    loginFlowRedirection(LC_EVENT_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_GOTO_URL_PLACEHOLDER, window.location.href);
                                    break;
                            }
                        });
                    } else {
                        // redirect to event-details page
                        loginFlowRedirection(LC_EVENT_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_GOTO_URL_PLACEHOLDER, window.location.href);
                    }
                });
            } else {
                // redirect to event-details page
                loginFlowRedirection(LC_EVENT_DETAILS_PAGE_URL, TI_INCORRECT_USER_FLOW_REDIRECT_GOTO_URL_PLACEHOLDER, window.location.href);
            }
        } catch (error) {
            // redirect to LMS home page
            window.location.href = LC_HOME_PAGE_URL;
        }
    } else {
        // user is logged-in
        manageUserInterfaceDistorting();
    }
};
 
$(document).ready(function() {
    manageIncorrectLoginFlow(); // do not allow direct access of TI pages without login
    managerFigureExpandable();
});
 
$(window).on('popstate', function() {
    // detect browser's back and forward navigation button clicks
    manageUserInterfaceDistorting();
    managerFigureExpandable();
});
