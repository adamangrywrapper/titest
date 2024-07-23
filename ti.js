var forgeIconBaseUrl = "https://forge.lseg.com/icons";
var globalSiteFooter = ".global-site-footer";
var LC_LAST_VISITED_REFERRER_COOKIE_NAME = "LC_LAST_VISITED_REFERRER";
var TI_LAST_VISITED_REFERRER_COOKIE_NAME = "TI_LAST_VISITED_REFERRER";
var TI_LAST_VISITED_REFERRER_COOKIE_VALUE = sessionStorage.getItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME);
var TI_INCORRECT_USER_FLOW_REDIRECT_URL_SLUG_PLACEHOLDER = "<SLUG-ID>";
var TI_INCORRECT_USER_FLOW_REDIRECT_GOTO_URL_PLACEHOLDER = "<GOTO-URL>";
var forgeRightArrowIcon = forgeIconBaseUrl + "/ui/blue/arrow-right.svg";
var TI_COURSE_DETAILS_SEARCH_URL = "/incoming/v2/content";
var TI_LEARNING_PATH_CERTIFICATE_PAGE_PATH = "/learn/learning-path/";
var TI_ADOBE_ANALYTICS_DEFAULT_DIGITAL_DATA = {
    page: {
        attributes: {},
        category: {},
        filters: {},
        pageInfo: {}
    },
    product: {},
    user: {
        profileInfo: {
            "userEmailSh256": {}
        }
    }
};
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
    <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
            } catch (error) {
                console.log("Kaltura video loading error: " + error);
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
                                <svg class="Icon Icon--s" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 32 32" xmlns:xlink="https://www.w3.org/1999/xlink" aria-hidden="true" focusable="false">
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

var updateLearningPathCertificateSessionStorage = (item = "") => {
    // TI learning path and certificate view course button add current url into session storage
    let isAddingTargetApplicable = false;
    const lastVisitedReferrer = sessionStorage.getItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME);

    if (lastVisitedReferrer &&  JSON.parse(lastVisitedReferrer).source) {
        isAddingTargetApplicable = true;
    }

    if (isAddingTargetApplicable) {
        sessionStorage.setItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME, JSON.stringify(
            {
                ...JSON.parse(sessionStorage.getItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME)),
                target: item
            }
        ));
    }
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

var getHashedEncryptionData = async (encryptType = "sha256", data = "") => {
    let hashedEncryptionData = "";

    switch (encryptType.toLocaleLowerCase()) {
        case "sha256":
            const textAsBuffer = new TextEncoder().encode(data);
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            hashedEncryptionData = hashArray.map(item => item.toString(16).padStart(2, "0")).join("");
        break;
    }

    return hashedEncryptionData;
};

var removeLearningPathCertificateSessionStorage = () => {
    /* user navigate from learning-paths/certificates pages to course details page,
    user navigated from course details page to another page then need to remove session storage 
    which stores the links between learning-paths/certificates pages with course details page */
    const learningPathCertificateSessionStorage = sessionStorage.getItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME);

    if (learningPathCertificateSessionStorage) {
        const learningPathCertificateSession = JSON.parse(learningPathCertificateSessionStorage);

        if (learningPathCertificateSession && learningPathCertificateSession.target && !window.location.pathname.includes(learningPathCertificateSession.target)) {
            sessionStorage.removeItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME);
            updateHeaderBackButtonNavigation(); // update header based back button navigation url
        }
    }

    const lastVisitedReferrerTimer = setInterval(() => {
        // used to re-create session storage if somehow already get deleted but need the session storage on the target page
        // so it will re-create the session storage
        const TI_LAST_VISITED_REFERRER_DATA = JSON.parse(TI_LAST_VISITED_REFERRER_COOKIE_VALUE);

        if (TI_LAST_VISITED_REFERRER_DATA && TI_LAST_VISITED_REFERRER_DATA.target && window.location.pathname.includes(TI_LAST_VISITED_REFERRER_DATA.target)) {
          sessionStorage.setItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME, JSON.stringify(TI_LAST_VISITED_REFERRER_DATA));
          updateHeaderBackButtonNavigation(); // update header based back button navigation url
          clearInterval(lastVisitedReferrerTimer);
        }
    }, 500);
};

var initAdobeAnalyticsDigitalData = async () => {
    window.digitalData = window.digitalData ? window.digitalData : TI_ADOBE_ANALYTICS_DEFAULT_DIGITAL_DATA;
    
    if (window.digitalData.user && window.digitalData.user.profileInfo && window.AtlasSettings && window.AtlasSettings.userEmail) {
        // Encrypt logged-in user's email address and add into adobe script based digital data object
        window.digitalData.user.profileInfo.userEmailSh256 = await getHashedEncryptionData("sha256", window.AtlasSettings.userEmail);
    }
};

$(document).ready(function() {
    initAdobeAnalyticsDigitalData();
    manageIncorrectLoginFlow(); // do not allow direct access of TI pages without login
    managerFigureExpandable();
    removeLearningPathCertificateSessionStorage();
});

$(window).on('popstate', function() {
    // detect browser's back and forward navigation button clicks
    manageUserInterfaceDistorting();
    managerFigureExpandable();
});

var headerLogoPath = ".container .company__beta-logo";
var learningPathHeaderLearnerPath = ".global-site-header .header-back-link-container .header-back-link";
var coursePageHomeIconPath = ".course .course__container .header .header__left .header__left__icon";
var updateHeaderBackButtonNavigation = () => {
    let lastVisitedReferrer = LC_HOME_PAGE_URL ? LC_HOME_PAGE_URL : "/";

    try {
        let learningPathCertificatePageReferrer = "";
        let learningPathCertificatePage = JSON.parse(sessionStorage.getItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME));

        if (learningPathCertificatePage && learningPathCertificatePage.source) {
            learningPathCertificatePageReferrer = learningPathCertificatePage.source; // TI based learning path and certificate visited referrer urls
        }

        const searchCatalogReferrer = getCookieTI(LC_LAST_VISITED_REFERRER_COOKIE_NAME);

        if (window.location.pathname.includes(TI_LEARNING_PATH_CERTIFICATE_PAGE_PATH)) {
            lastVisitedReferrer = searchCatalogReferrer;
            sessionStorage.removeItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME);
        } else if (learningPathCertificatePageReferrer || searchCatalogReferrer) {
            lastVisitedReferrer = learningPathCertificatePageReferrer ? learningPathCertificatePageReferrer : searchCatalogReferrer;
        }
    } catch {
        lastVisitedReferrer = LC_HOME_PAGE_URL ? LC_HOME_PAGE_URL : "/";
    }

    $(learningPathHeaderLearnerPath + " .btn").attr("href", lastVisitedReferrer);
};

domElementDetector(headerLogoPath, () => {
    $(headerLogoPath).attr("href", "/learn/dashboard"); // lseg logo link redirection
    $(headerLogoPath + " img").attr("alt", TI_HEADER_LSEG_LOGO_ARIA_LABEL);
});

domElementDetector(coursePageHomeIconPath, () => {
    $(coursePageHomeIconPath).attr(
        {
            "alt": TI_HEADER_LSEG_LOGO_ARIA_LABEL,
            "aria-label": TI_HEADER_LSEG_LOGO_ARIA_LABEL,
            "title": TI_HEADER_LSEG_LOGO_ARIA_LABEL
        }
    );
});

domElementDetector(learningPathHeaderLearnerPath, () => {
    if (!$("body").hasClass("manager")) {
        $(".global-site-header").show();
    }
});

$(document).ready(function () {
    updateHeaderBackButtonNavigation();
});

var globalSiteFooter = ".global-site-footer";
var globalSiteFooterToggleButtonPath = globalSiteFooter + " .GlobalFooter-button";

domElementDetector(globalSiteFooterToggleButtonPath, () => {
    $(globalSiteFooterToggleButtonPath + " .GlobalFooter-caret svg").css({"transform": "none"});
    $(globalSiteFooterToggleButtonPath).css({"background": "rgba(0,0,0,0)"});
    $(globalSiteFooter + " .GlobalFooter-inner nav").show();

    $(globalSiteFooterToggleButtonPath).on("click", function() {
        $(globalSiteFooter + " .GlobalFooter-inner nav").toggle();
    
        const globalSiteFooterToggleState = $(globalSiteFooterToggleButtonPath + " .GlobalFooter-caret svg").css("transform");
        
        if (globalSiteFooterToggleState === "none") {
            $(globalSiteFooterToggleButtonPath + " .GlobalFooter-caret svg").css({"transform": "rotate(180deg)"});
            $(document).scrollTop($(document).height() - $(globalSiteFooter + " .GlobalFooter-inner").height());
        } else {
            $(globalSiteFooterToggleButtonPath + " .GlobalFooter-caret svg").css({"transform": "none"});
        }
    });
});

setTimeout(() => {
    $(globalSiteFooter).show();

    if ($(globalSiteFooterToggleButtonPath).is(":visible")) {
        $(globalSiteFooter + " .GlobalFooter-inner nav").hide();
    }
}, 3000);

domElementDetector("body.home.course-group", () => {
    /* Default option with variable from URL */
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get('sessionId');

    /* Common variable path */
    const courseContainer = ".course-group .container";
    const courseDetailSidebarPath = ".course-group .container .home__content .course__detail__container .course__detail__sidebar .layout__content--sidebar";

    /* Right Arrow icon */
    const rightArrowIconImgSrc = forgeIconBaseUrl + "/ui/grey/arrow-right-07.svg";
    const caretDownImgSrc = forgeIconBaseUrl + "/ui/grey/caret-down-07.svg";

    /* Button text changes */
    const courseDetailSidebarButtonText = "Confirm enrolment";
    const courseDetailSidebarClassTitleValue = "Enrol in this session";
    const courseDetailSidebarVideoTitleValue = "Video course";

    /* Icon image */
    const rightArrowIcon = `<img class="related_course_icon" width="20" height="20" src="${rightArrowIconImgSrc}"/>`;

    /* Email support variables */
    const courseDetailSidebarEmailSupportTitle = "Not Available";
    const courseDetailSidebarEmailSupportLink = "training@lseg.com";
    const courseDetailSidebarEmailSupportLinkText = "Contact us to request this class";

    /* Common function to format the string */
    let formatCourseDetailsStringResult = (courseValue) => {
        return JSON.stringify(courseValue).replaceAll('"', '');
    };

    const updateCourseDetailsRelatedVideosClasses = (results = "") => {
        // Updating related videos/classes links to navigate users from TI to search catalogue page to fetch related videos/classes
        let courseDetailsRelatedVideosClassesFilters = "";

        results.forEach((result) => {
            Object.keys(result).forEach((resultItemKey) => {
                let resultItem = (result[resultItemKey] && result[resultItemKey].raw) ? result[resultItemKey].raw : "";

                if (LC_CATALOGUE_FILTERS_MAPPING_LIST && LC_CATALOGUE_FILTERS_MAPPING_LIST.includes(resultItemKey) && resultItem) {
                    if (Array.isArray(resultItem)) {
                        resultItem = resultItem.toString().split(",").join("|");
                    }

                    courseDetailsRelatedVideosClassesFilters += `&${resultItemKey}=${resultItem}`;
                }
            });
        });

        LC_CATALOGUE_RELATED_VIDEOS_PAGE_URL = LC_CATALOGUE_RELATED_VIDEOS_PAGE_URL + courseDetailsRelatedVideosClassesFilters;
        LC_CATALOGUE_RELATED_CLASSES_PAGE_URL = LC_CATALOGUE_RELATED_CLASSES_PAGE_URL + courseDetailsRelatedVideosClassesFilters;

        $(courseDetailSidebarPath + " .widget--course-related.widget--course-related_standard .course_sidebar_useful_links_container .related-videos").attr("href", LC_CATALOGUE_RELATED_VIDEOS_PAGE_URL);
        $(courseDetailSidebarPath + " .widget--course-related.widget--course-related_standard .course_sidebar_useful_links_container .related-classes").attr("href", LC_CATALOGUE_RELATED_CLASSES_PAGE_URL);
    };

    /* Ajax call to elastic search to get the course details */
    domElementDetector(courseContainer, () => {
        const urlPathName = window.location.pathname;
        const urlPathNameArray = urlPathName.split('/');
        const courseSlugValue = urlPathNameArray[2];

        if (courseSlugValue) {
            getCourseDetails(courseSlugValue).then((data) => {
                let results = data.results;

                if (results.length > 0) {
                    updateCourseDetailsRelatedVideosClasses(results); // Updating related videos/classes links

                    const lcType = formatCourseDetailsStringResult(results[0].lc_type.raw);

                    if (lcType) {
                        const courseDetailSidebarTitle = courseDetailSidebarPath + " .sidebar_title_container .sidebar_title";

                        domElementDetector(courseDetailSidebarPath, () => {
                            let courseDetailSidebarTitleValue = "";

                            switch (lcType.toLowerCase()) {
                                case "class":
                                    const courseDetailSidebarMultiSelect = courseDetailSidebarPath + " .panel #session-select";
                                    const courseDetailSidebarButtonTextPath = courseDetailSidebarPath + " .btn";

                                    if ($(courseDetailSidebarMultiSelect).length <= 0) {
                                        const courseDetailSidebarButtonTextValue = $(courseDetailSidebarButtonTextPath).text();

                                        if (!courseDetailSidebarButtonTextValue.toLowerCase().includes("resume")) {
                                            $(courseDetailSidebarButtonTextPath).text(courseDetailSidebarButtonText);
                                        }
                                    }

                                    courseDetailSidebarTitleValue = courseDetailSidebarClassTitleValue;
                                    break;
                                case "playlist":
                                    courseDetailSidebarTitleValue = courseDetailSidebarVideoTitleValue;
                                    break;
                                case "video":
                                    courseDetailSidebarTitleValue = courseDetailSidebarVideoTitleValue;
                                    break;
                            }

                            const courseDetailSidebarTitleHTML = `
                                <div class="sidebar_title_container">
                                    <div class="sidebar_title">${courseDetailSidebarTitleValue}</div>
                                </div>
                            `;

                            if ($(courseDetailSidebarTitle).length <= 0) {
                                $(courseDetailSidebarPath).prepend(courseDetailSidebarTitleHTML);
                            }
                        });
                    }
                }
            });
        }
    });

    /* Adding class name for course detail sidebar */
    const courseDetailSidebarContainerPath = ".course-group .container .home__content .course__detail__container .course__detail__sidebar";

    domElementDetector(courseDetailSidebarContainerPath, () => {
        $(courseDetailSidebarContainerPath).parent().addClass('course_sidebar_parent');
    });

    /* Appending course title below course detail header */
    const courseDetailContainerPath = ".course-group .container .home__content .course__detail__container";
    const courseDetailTitlePath = ".course-group .container .home__content .course__detail__container .course__detail__content .course__detail__header .h2";
    const courseDetailHeaderTitlePath = ".course-group .container .home__content .course_title";

    domElementDetector(courseDetailContainerPath, () => {
        const courseDetailTitleValue = $(courseDetailTitlePath).text();
        const courseDetailTitleHTML = `
            <div class="course_title">
                <span class="course_title_value">
                    ${courseDetailTitleValue}
                </span>
            </div>
        `;

        if ($(courseDetailHeaderTitlePath).length <= 0) {
            $(courseDetailTitleHTML).insertBefore(courseDetailContainerPath);
        }
    });

    /* Course detail sidebar Related course section */
    const courseDetailSidebarRealtedCourseList = courseDetailSidebarPath + " .widget--course-related .course__related .course__related__list li";

    domElementDetector(courseDetailSidebarRealtedCourseList, () => {
        setTimeout(() => {
            $(courseDetailSidebarRealtedCourseList).each(function (index, item) {
                const listItem = $(item);
                const listItemImageBoolean = listItem.html().includes('related_course_icon');

                if (!listItemImageBoolean) {
                    listItem.append(rightArrowIcon);
                }
            });
        }, 100);
    });

    /* Custom session dropdown */
    const courseDetailSidebarSessionDropdown = courseDetailSidebarPath + " .widget--course-purchase .panel #session-select";

    domElementDetector(courseDetailSidebarSessionDropdown, () => {
        /* Custom session dropdown Paths */
        const courseDetailSidebarCustomSessionDropdown = courseDetailSidebarPath + " .widget--course-purchase .panel .session-dropdown";
        const courseDetailSidebarCustomSessionDropdownDefault = courseDetailSidebarPath + " .widget--course-purchase .panel .session-dropdown .session-dropdown-container .option-default";
        const courseDetailSidebarCustomSessionDropdownImg = courseDetailSidebarPath + " .widget--course-purchase .panel .session-dropdown .session-dropdown-container .session-dropdown-caret-down"
        const courseDetailSidebarCustomSessionDropdownContent = courseDetailSidebarPath + " .widget--course-purchase .panel .session-dropdown .session-dropdown-content";
        const courseDetailSidebarCustomSessionDropdownOption = courseDetailSidebarPath + " .widget--course-purchase .panel .session-dropdown .session-dropdown-content .session-dropdown-option";

        /* Default session dropdown Paths */
        const courseDetailSidebarDefaultSessionDropdown = courseDetailSidebarPath + " .widget--course-purchase .panel .enroll__session__select";
        const courseDetailSidebarDefaultSessionDropdownOption = courseDetailSidebarPath + " .widget--course-purchase .panel .enroll__session__select option";

        /* Webinar dates label path */
        const courseDetailSidebarWebinarDates = courseDetailSidebarPath + " .panel .webinar__dates li";

        let selectedSessionValue = "";
        let selectedSessionText = "";

        /* Custom session dropdown HTML */
        let courseDetailSidebarSessionDropdownHTML = `
            <div class="session-dropdown">
                <div class="session-dropdown-container">
                    <div class="option-default">Select</div>
                    <img class="session-dropdown-caret-down" height="18" width="18" src="${caretDownImgSrc}"/>
                </div>
                <div class="session-dropdown-content"></div>
            </div>
        `;

        /* Append the custom session dropdown HTML below TI default dropdown */
        if ($(courseDetailSidebarCustomSessionDropdown).length <= 0) {
            $(courseDetailSidebarSessionDropdownHTML).insertAfter(courseDetailSidebarSessionDropdown);
        }

        /* Getting default option from default session dropdown */
        selectedSessionText = $(courseDetailSidebarDefaultSessionDropdownOption).eq(0).text();
        selectedSessionValue = $(courseDetailSidebarDefaultSessionDropdownOption).eq(0).attr("value");

        /* Change the text for default option */
        $(courseDetailSidebarCustomSessionDropdownDefault).text(selectedSessionText);

        /* Create custom options based on default session dropdown */
        $(courseDetailSidebarDefaultSessionDropdownOption).each(function () {
            const optionText = $(this).text();
            const optionValue = $(this).attr("value");
            const option = `<div class="session-dropdown-option" value="${optionValue}">${optionText}</div>`;

            $(courseDetailSidebarCustomSessionDropdownContent).each(function (index, item) {
                const listItem = $(item);
                const listItemOptionBoolean = listItem.html().includes(optionValue);

                if (!listItemOptionBoolean) {
                    $(courseDetailSidebarCustomSessionDropdownContent).append(option);
                }
            })
        });

        /* Custom session dropdown click functionality */
        $(courseDetailSidebarCustomSessionDropdown).on("click", function (e) {
            if ($(courseDetailSidebarCustomSessionDropdownContent).css('display') === 'none') {
                $(courseDetailSidebarCustomSessionDropdownImg).css("rotate", "180deg");
                $(courseDetailSidebarCustomSessionDropdownContent).css("display", "block");
            } else {
                $(courseDetailSidebarCustomSessionDropdownImg).css("rotate", "0deg");
                $(courseDetailSidebarCustomSessionDropdownContent).css("display", "none");
            }
        });

        /* Custom session dropdown option click functionality */
        $(courseDetailSidebarCustomSessionDropdownOption).on("click", function (e) {
            const selectedValue = $(this).attr("value");
            const selectedText = $(this).text();

            selectedSessionValue = selectedValue;
            selectedSessionText = selectedText;
            $(courseDetailSidebarCustomSessionDropdownDefault).text(selectedText);
            $(courseDetailSidebarWebinarDates).text(selectedSessionText);

            $(courseDetailSidebarCustomSessionDropdownOption).each(function (index, item) {
                $(item).removeClass().addClass("session-dropdown-option");
            });

            $(this).addClass("selected-option");

            $(courseDetailSidebarSessionDropdown + " option").each(function (index, item) {
                if ($(item).attr("value") === selectedValue) {
                    $(item).prop("selected", true);
                    $(courseDetailSidebarSessionDropdown).trigger('change');
                } else {
                    $(item).prop("selected", false);
                }
            });

            setTimeout(() => {
                $(courseDetailSidebarCustomSessionDropdownImg).css("rotate", "0deg");
                $(courseDetailSidebarCustomSessionDropdownContent).hide();
            }, 5);
        });

        /* Click outside dropdown close the content */
        $(document).on("click", function (event) {
            let $trigger = $(courseDetailSidebarCustomSessionDropdown);

            if ($trigger !== event.target && !$trigger.has(event.target).length) {
                $(courseDetailSidebarCustomSessionDropdownImg).css("rotate", "0deg");
                $(courseDetailSidebarCustomSessionDropdownContent).hide();
            }
        });

        /* Change button text in case of multi select dropdown */
        const existing_button_path = courseDetailSidebarPath + " .panel .btn";

        $(existing_button_path).text(courseDetailSidebarButtonText);
        $(courseDetailSidebarDefaultSessionDropdown).hide();

        if (sessionId) {
            $(courseDetailSidebarCustomSessionDropdownOption).each(function () {
                if ($(this).attr("value") === sessionId) {
                    const selectedText = $(this).text();

                    selectedSessionText = selectedText;

                    const selectedValue = $(this).attr("value");

                    selectedSessionValue = selectedValue;
                    $(courseDetailSidebarCustomSessionDropdownDefault).text(selectedText);
                    $(courseDetailSidebarWebinarDates).text(selectedSessionText);
                    $(this).addClass("selected-option");

                    $(courseDetailSidebarSessionDropdown + " option").each(function (index, item) {
                        if ($(item).attr("value") === selectedValue) {
                            $(item).prop("selected", true);
                            $(courseDetailSidebarSessionDropdown).trigger('change');
                        } else {
                            $(item).prop("selected", false);
                        }
                    });
                }
            });
        } else {
            $(courseDetailSidebarCustomSessionDropdownOption).each(function () {
                if ($(this).attr("value") === selectedSessionValue) {
                    const selectedText = $(this).text();

                    selectedSessionText = selectedText;

                    const selectedValue = $(this).attr("value");

                    selectedSessionValue = selectedValue;
                    $(courseDetailSidebarCustomSessionDropdownDefault).text(selectedText);
                    $(courseDetailSidebarWebinarDates).text(selectedSessionText);
                    $(this).addClass("selected-option");
                }
            });
        }
    });

    /* Adding horizontal lines before and after default start button */
    const courseDetailHorizontalLineHTML = `<hr class="sidebar_horizontal_line">`;
    const courseDetailSidebarDefaultButtonPath = courseDetailSidebarPath + " a.btn";
    const courseDetailHorizontalLinePath = courseDetailSidebarPath + " .sidebar_horizontal_line";

    domElementDetector(courseDetailSidebarDefaultButtonPath, () => {
        if ($(courseDetailHorizontalLinePath).length <= 0) {
            $(courseDetailHorizontalLineHTML).insertBefore(courseDetailSidebarDefaultButtonPath);
            $(courseDetailHorizontalLineHTML).insertAfter(courseDetailSidebarDefaultButtonPath);
        }
    });

    /* Adding Email Support in case of no class to enroll For Learner */
    const courseDetailSidebarEmailSupportPath = courseDetailSidebarPath + " .widget--course-purchase .panel .email-capture";
    const courseDetailSidebarPurchaseWidget = courseDetailSidebarPath + " .widget--course-purchase";
    const courseDetailSidebarEmailPath = courseDetailSidebarPath + " .course_sidebar_email_support_container";

    domElementDetector(courseDetailSidebarEmailSupportPath, () => {
        const courseDetailSidebarEmailSupportHTML = `
            <div class="course_sidebar_email_support_container">
                <div class="email_support_content_section">
                    <div class="email_support_title">${courseDetailSidebarEmailSupportTitle}</div>
                    <a class="email_support_link" href="mailto:${courseDetailSidebarEmailSupportLink}">${courseDetailSidebarEmailSupportLinkText}</a> 
                </div>
                <div class="email_support_icon_section">
                    ${rightArrowIcon}
                </div>
            </div>
        `;

        if ($(courseDetailSidebarEmailPath).length <= 0) {
            $(courseDetailSidebarEmailSupportHTML).insertAfter(courseDetailSidebarPurchaseWidget);
        }

        $(courseDetailSidebarPurchaseWidget).hide();
    });

    /* Adding Useful links as per LMS PH3 UX design */
    const courseDetailSidebarUsefulLinksWidget = courseDetailSidebarPath + " .widget--course-related.widget--course-related_standard";

    domElementDetector(courseDetailSidebarUsefulLinksWidget, () => {
        const courseDetailSidebarUsefulLinksHTML = `
            <div class="course_sidebar_useful_links_container">
                <div class="VerticalSpacing VerticalSpacing--m"></div>
                <div class="VerticalSpacing VerticalSpacing--m">
                    <div class="Header">
                        <div class="Header-heading">
                            <h5 class="Typestack Typestack--subline1">${TI_COURSE_USEFUL_LINKS_LABEL}</h5>
                        </div>
                    </div>
                </div>
                <div class="ListOfLinks">
                    <div class="ListOfLinks-inner">
                        <ul class="ListOfLinks-items ListOfLinks-items--col1">
                            <li class="ListOfLinksBlockLink ListOfLinksBlockLink--small u-topBorder">
                                <a class="ListOfLinksBlockLink-link related-videos" href="${LC_CATALOGUE_RELATED_VIDEOS_PAGE_URL}">
                                    <div class="ListOfLinksBlockLink-inner">
                                        <div class="ListOfLinksBlockLink-container">
                                            <div class="ListOfLinksBlockLink-body">
                                                <div class="ListOfLinksBlockLink-text">
                                                    <div class="ListOfLinksBlockLink-title Typestack--p1Bold">${TI_COURSE_RELATED_VIDEOS_LABEL}</div>
                                                </div>
                                                <div class="ListOfLinksBlockLink-icon" aria-hidden="true">
                                                    <img class="Icon Icon--s" alt="" src="${forgeIconBaseUrl}/ui/grey/arrow-right-07.svg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li class="ListOfLinksBlockLink ListOfLinksBlockLink--small u-topBorder">
                                <a class="ListOfLinksBlockLink-link related-classes" href="${LC_CATALOGUE_RELATED_CLASSES_PAGE_URL}">
                                    <div class="ListOfLinksBlockLink-inner">
                                        <div class="ListOfLinksBlockLink-container">
                                            <div class="ListOfLinksBlockLink-body">
                                                <div class="ListOfLinksBlockLink-text">
                                                    <div class="ListOfLinksBlockLink-title Typestack--p1Bold">${TI_COURSE_RELATED_CLASSES_LABEL}</div>
                                                </div>
                                                <div class="ListOfLinksBlockLink-icon" aria-hidden="true">
                                                    <img class="Icon Icon--s" alt="" src="${forgeIconBaseUrl}/ui/grey/arrow-right-07.svg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                            <li class="ListOfLinksBlockLink ListOfLinksBlockLink--small u-topBorder">
                                <a class="ListOfLinksBlockLink-link view-catalogue" href="${LC_CATALOGUE_PAGE_URL}">
                                    <div class="ListOfLinksBlockLink-inner">
                                        <div class="ListOfLinksBlockLink-container">
                                            <div class="ListOfLinksBlockLink-body">
                                                <div class="ListOfLinksBlockLink-text">
                                                    <div class="ListOfLinksBlockLink-title Typestack--p1Bold">${TI_COURSE_VIEW_CATALOGUE_LABEL}</div>
                                                </div>
                                                <div class="ListOfLinksBlockLink-icon" aria-hidden="true">
                                                    <img class="Icon Icon--s" alt="" src="${forgeIconBaseUrl}/ui/grey/arrow-right-07.svg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        $(courseDetailSidebarUsefulLinksWidget).html(courseDetailSidebarUsefulLinksHTML);
    });
});

domElementDetector("body.learn.course", () => {
    /* Common variable path */
    const sidebarCompletedText = "Course completed";
    const sidebarTextareaPlaceholderText = "Your feedback";
    const courseDetailContainerPath = ".course .course__container";
    const learnerContainerPath = ".course .course__container .learner__container";
    const contentContainerPath = ".course .course__container .learner__container .learner__content";
    const sibebarContainerPath = ".course .course__container .sidebar__container";
    const backgroundOverlay = ".course .course__container .completed-section__overlay";

    /* PNG icons for course details page */
    const closeIconURL = forgeIconBaseUrl + "/ui/grey/close-07.svg";
    const completedImageURL = forgeIconBaseUrl + "/ui/green/success.svg";

    /* START - Sidebar Navigation JS (Modal Popup) */
    const sidebarNavigationContainer = ".course .course__container .sidebar__container";
    const sidebarNavigationContainerHeading = ".course .course__container .sidebar__container .heading";
    
    domElementDetector(sidebarNavigationContainer, () => {
        domElementDetector(sidebarNavigationContainerHeading, () => {
            /* Appending completed icon */
            const completedImageHTMLTag = `<img class="sidebar_success_img" width="60" height="60" src="${completedImageURL}"/>`;

            if ($(sidebarNavigationContainer + " .sidebar_success_img").length <= 0) {
                $(sidebarNavigationContainer).prepend(completedImageHTMLTag);
            }

            /* Appending close icon */
            const closeImageHTMLTag = `
            <div class="sidebar_close_img_container">
               <a href="javascript: void(0);" class="sidebar_close_img" aria-label="close">
               <img width="20" height="20" src="${closeIconURL}"/>
               </a>
            </div>
            `;

            if ($(sidebarNavigationContainer + " .sidebar_close_img").length <= 0) {
                $(sidebarNavigationContainer).prepend(closeImageHTMLTag);
            }

            /* Cross icon click event */
            const crossIconPath = ".course .course__container .sidebar__container .sidebar_close_img";
            $(crossIconPath).on("click", function () {
                $(sibebarContainerPath).css("display", "none");
                $(backgroundOverlay).css("display", "none");
            });

            /* Make sidebar heading generic */
            $(sidebarNavigationContainerHeading).text(sidebarCompletedText);

            /* Appending placeholder for textarea in sidebar for feedback */
            const sidebarFeedbackTextarea = sidebarNavigationContainer + " .sidebar__testimonial .panel .ember-text-area.form-control";

            if ($(sidebarFeedbackTextarea).length > 0) {
                $(sidebarFeedbackTextarea).attr("placeholder", sidebarTextareaPlaceholderText);
            }
        });
    });

    /* Next section button click event */
    const nextButtonPath = contentContainerPath + " .directional__nav .directional__nav__button__container--next";

    domElementDetector(learnerContainerPath, () => {
        $(nextButtonPath).on("click", function () {
            $(sibebarContainerPath).removeAttr("style");
            $(backgroundOverlay).removeAttr("style");
        });
    });

    /* Add parent class to the cta in class listing course details page */
    const contentButtonPath = contentContainerPath + " .layout-panel .topic__container .topic__content .row .columns p .btn";
    
    domElementDetector(contentButtonPath, () => {
        $(contentButtonPath).parent().addClass("class_details_cta");
    });

    /* Getting slug value from URL and hitting ajax call */
    domElementDetector(courseDetailContainerPath, () => {
        const urlPathName = window.location.pathname;
        const urlPathNameArray = urlPathName.split('/');
        const courseSlugValue = urlPathNameArray[3];

        if (courseSlugValue) {
            /* TI learning path and certificate view course back button navigation changes Start */
            const courseSlugValueWithPathNames = urlPathName.split(`/${courseSlugValue}`);
            const courseSlugValueWithPathName = courseSlugValueWithPathNames[0] + `/${courseSlugValue}`;
            updateLearningPathCertificateSessionStorage(courseSlugValueWithPathName);
            /* TI learning path and certificate view course back button navigation changes End */

            getCourseDetails(courseSlugValue).then((data) => {
                let results = data.results;

                if (results.length > 0) {
                    let courseDetailHTML = `<div class="course_details">

                    ${results[0].description ? `<div class="course_description"> 
                        <strong>Course Description</strong>
                        <p>${results[0].description.raw}</p>
                    </div>` : ''}

                    ${results[0].w_product_type ? `<div class="course_product"> 
                        <strong>Product</strong>
                        <p>${results[0].w_product_type.raw}</p>
                    </div>` : ''}

                    ${results[0].lc_parentsector ? `<div class="course_market_sector"> 
                        <strong>Market Sector</strong>
                        <p>${results[0].lc_parentsector.raw}</p>
                    </div>` : ''}

                    ${results[0].lc_skilllevel ? `<div class="course_skill_level"> 
                        <strong>Skill</strong>
                        <p>${results[0].lc_skilllevel.raw}</p>
                    </div>` : ''}

                    ${results[0].lc_language ? `<div class="course_language"> 
                        <strong>Language</strong>
                        <p>${results[0].lc_language.raw}</p>
                    </div>` : ''}

                    </div>`;

                    const classCTAButton = contentContainerPath + " .layout-panel .topic__container .topic__content .row .columns .class_details_cta";
                    const courseDetailsPath = contentContainerPath + " .layout-panel .topic__container .topic__content .row .columns .course_details";
                    
                    domElementDetector(classCTAButton, () => {
                        if ($(courseDetailsPath).length <= 0) {
                            $(courseDetailHTML).insertAfter(classCTAButton);
                        }
                    });
                }
            });
        }
    });
});

var myLearningTableDashboardManager = () => {
    const myLearningTableDashboardPath = ".dashboard .container .widget--dashboard-access .dashboard-access .dashboard-access-list-item";
    
    domElementDetector(myLearningTableDashboardPath, () => {
        const myLearningTableRowLength = $(myLearningTableDashboardPath).length;

        for (let myLearningTableRowCount = 0; myLearningTableRowCount < myLearningTableRowLength; myLearningTableRowCount++) {
            let myLearningTableItemsCenter = $(myLearningTableDashboardPath).eq(myLearningTableRowCount).find(".items-center");

            if ($(myLearningTableItemsCenter).length > 0) {
                $(myLearningTableItemsCenter).removeClass().addClass("dashboard-access-flex-container");

                $(myLearningTableItemsCenter).children().eq(0).addClass("dashboard-accordian");
                $(myLearningTableItemsCenter).children().eq(1).hide();
                $(myLearningTableItemsCenter).children().eq(2).addClass("dashboard-content-type");
                $(myLearningTableItemsCenter).children().eq(3).addClass("access_cta_button");
            } else {
                // For certifications
                myLearningTableItemsCenter = $(myLearningTableDashboardPath).eq(myLearningTableRowCount).find(".row");
                $(myLearningTableItemsCenter).removeClass().addClass("dashboard-access-flex-container");

                $(myLearningTableItemsCenter).children().eq(0).removeClass().addClass("certificate_title");

                $(myLearningTableItemsCenter).children().eq(1).removeClass().addClass("certificate_type");

                $(myLearningTableItemsCenter).children().eq(2).removeClass().addClass("certificate_access_buttons");
                $(myLearningTableItemsCenter).children().eq(2).find(".medium-6.columns").eq(0).addClass("view_certificate");
                $(myLearningTableItemsCenter).children().eq(2).find(".medium-6.columns").eq(1).find(".btn").addClass("linked_in_button");
                $(myLearningTableItemsCenter).children().eq(2).find(".medium-6.columns").eq(1).find(".btn").eq(0).find("span").addClass("linked_in_text");
            }
        }
    });
};

domElementDetector("body.learn.dashboard", () => {
    /* Common variables path */
    const dashboardMainContentInner = ".dashboard .container .dashboard_main_content .dashboard_main_content_inner";
    const headerColumnPath = ".dashboard .container .header--dashboard .header__inner .row .column";

    /* Icons url for different content types */
    const dashboardPopulateWidgetDefaultIcon = forgeIconBaseUrl + "/nucleo/school-education/large/collection.svg";
    const dashboardPopulateWidgetClassIcon = forgeIconBaseUrl + "/nucleo/files-folders/large/class.svg";
    const dashboardPopulateWidgetVideoIcon = forgeIconBaseUrl + "/nucleo/technology/large/video.svg";
    const dashboardPopulateWidgetPlaylistIcon = "https://d36ai2hkxl16us.cloudfront.net/thoughtindustries/image/upload/a_exif,c_fit,w_300/v1/course-uploads/612cd12a-1c8b-4937-8762-a40dc3dc6958/1ci6nhs49v5w-67VideoPlaylist.png";
    const dashboardPopulateWidgetLearningpathIcon = "https://d36ai2hkxl16us.cloudfront.net/thoughtindustries/image/upload/a_exif,c_fit,w_300/v1/course-uploads/612cd12a-1c8b-4937-8762-a40dc3dc6958/dbe2zyvtgusg-71Learning-path.png";
    const dashboardPopulateWidgetCertificateIcon = "https://d36ai2hkxl16us.cloudfront.net/thoughtindustries/image/upload/a_exif,c_fit,w_300/v1/course-uploads/612cd12a-1c8b-4937-8762-a40dc3dc6958/ysvyjt3of7vm-70Certification.png";

    /* Custom text variables */
    const dashboardHeroEyebrowText = "Learning Centre";

    /* My Access tab manager */
    myLearningTableDashboardManager();
    
    const dashboardAccessTab = dashboardMainContentInner + " .widget--dashboard-access .dashboard-access-tabs li";
    
    domElementDetector(dashboardAccessTab, () => {
        $(dashboardAccessTab).on('click touchstart', function() {
            myLearningTableDashboardManager();
        });
    });

    /* Applying css for header column */
    domElementDetector(headerColumnPath, () => {
        $(headerColumnPath).eq(1).css("justify-content", "right");
    });
    
    /* Applying css for featured content (Cards section) */
    const dashboardFeaturedPath = dashboardMainContentInner + " .widget--featured-content .row";
    
    domElementDetector(dashboardFeaturedPath, () => {
        $(dashboardFeaturedPath).eq(0).css({"max-width":"1280px", "margin":"auto"});
    });

    /* Getting Learning Centre Pill text and url from widget */

    let dashboardHeaderLearningPill = "";
    const dashboardLearningCentreURLPath = dashboardMainContentInner + " .dashboard-learning-centre-url";
    domElementDetector(dashboardLearningCentreURLPath, () => {
        $(dashboardLearningCentreURLPath).css("display", "none");

        let learningCentrePillURL = $(dashboardMainContentInner + " .dashboard-learning-centre-url .widget__cta .btn").attr("href");
        let learningCentrePillText = $(dashboardMainContentInner + " .dashboard-learning-centre-url .widget__cta .btn").text();

        dashboardHeaderLearningPill = `<a class="dashboard-header__learning_name" href="${learningCentrePillURL}">
            <span>${learningCentrePillText}</span>
         </a>`;

        /* Adding Learning Center URL Pill in header */
        const dashboardHeaderNamePath = headerColumnPath + " .dashboard-header-dropdown__link";
        const dashboardHeaderLearningPillPath = headerColumnPath + " .dashboard-header__learning_name";
        
        domElementDetector(dashboardHeaderNamePath, () => {
            if ($(dashboardHeaderLearningPillPath).length <= 0) {
                $(dashboardHeaderLearningPill).insertBefore(dashboardHeaderNamePath);
            }
        });
    });

    /* Hero block eyebrow section */
    const dashboardHeroTitle = dashboardMainContentInner + " .widget--hero-image .hero__caption .hero__title";
    const dashboardHeroEyebrowPath = dashboardMainContentInner + " .widget--hero-image .hero__caption .hero_eyebrow";
    
    domElementDetector(dashboardHeroTitle, () => {
        const dashboardHeroEyebrowHTML = `<span class="hero_eyebrow">${dashboardHeroEyebrowText}</span>`;

        if ($(dashboardHeroEyebrowPath).length <= 0) {
            $(dashboardHeroEyebrowHTML).insertBefore(dashboardHeroTitle);
        }
    });

    /* Wrapping the dashboard main content */

    const dashboardContainerPath = ".dashboard .container";
    const dashboardMainContent = `<div class="dashboard_main_content"></div>`;
    
    domElementDetector(dashboardContainerPath, () => {
        $(dashboardContainerPath).find("div[role='main']").addClass("dashboard_main_content_inner");
        $(dashboardContainerPath).find("div[role='main']").wrap(dashboardMainContent);
    });

    /* Adding brackets for count in access tabs */
    const dashboardAccessWidgetCountList = dashboardMainContentInner + " .widget--dashboard-access .dashboard-access-tabs li .dashboard-access-tab__count";
    
    domElementDetector(dashboardAccessWidgetCountList, () => {
        $(dashboardAccessWidgetCountList).each(function (index, item) {
            const listItem = $(item);
            const listItemCount = listItem.text().replace(/[()]/g, "");
            $(listItem).text(`(${listItemCount})`);
        });
    });

    /* TI Cards js changes start */

    /* Generating img source and appending it in cards */
    const getCourseTypeIcon = (courseType = "") => {
        let courseTypeIcon = dashboardPopulateWidgetDefaultIcon;
        const courseTypeLabel = $.trim(courseType.toLowerCase());
        
        switch (courseTypeLabel) {
            case "on-demand video":
            case "video":
                courseTypeIcon = dashboardPopulateWidgetVideoIcon;
                break;
            case "on-demand video playlist":
                courseTypeIcon = dashboardPopulateWidgetPlaylistIcon;
                break;
            case "virtual class (zoom)":
            case "virtual class (webex)":
            case "virtual class (teams)":
            case "live class":
                courseTypeIcon = dashboardPopulateWidgetClassIcon;
                break;
            case "learning path":
                courseTypeIcon = dashboardPopulateWidgetLearningpathIcon;
                break;
            case "pathway/cert assessment":
                courseTypeIcon = dashboardPopulateWidgetCertificateIcon;
                break;
            default:
                courseTypeIcon = dashboardPopulateWidgetDefaultIcon;
                break;
        }

        return courseTypeIcon;
    };

    const dashboardCardItems = ".dashboard .container .widget--featured-content .featured-content-block-grid .featured-content-article-item .featured-content-article-item__body .featured-content-multi-carousel-item__source strong";
    
    domElementDetector(dashboardCardItems, () => {
        $(dashboardCardItems).each((index, item) => {
            const listItem = $(item);
            const listItemCourseType = listItem.text();
            const listItemImageBoolean = listItem.html().includes('img');
            const iconChange = `<img class="grid_item_image" width="48" height="48" src=${getCourseTypeIcon(listItemCourseType)} alt="" />`;
            
            if (!listItemImageBoolean) {
                $(listItem).prepend(iconChange);
            }
        });
    });

    domElementDetector(dashboardMainContentInner, () => {
        // translating course/event description html tags as per html rendering
        // removing displaying of html tags and render them to appear actual html
        $(dashboardMainContentInner).on("click", "button.dashboard-access-list-item-expander", function() {
            setTimeout(() => {
                const dashboardAccessListItemDescription = $(this).closest(".dashboard-access-list-item");
                const dashboardAccessListItemDescriptionText = dashboardAccessListItemDescription.find(".dashboard-access-list-item__description").text();

                dashboardAccessListItemDescription.find(".dashboard-access-list-item__description").html(dashboardAccessListItemDescriptionText);
            });
        });
    });

    /* TI dashboard SCORM continue button changes Start */
    $(document).on("click", $(dashboardMainContentInner + " .widget--dashboard-access .dashboard-access-list-item .access_cta_button button.btn--primary"), function(event) {
        if (event && event.target && (event.target.href === "#" || event.target.href === undefined) && event.target.innerText.toLowerCase() === "continue") {
            const learnerDashboardAccessListItemTimer = setInterval(() => {
                if ($(dashboardMainContentInner + " .widget--dashboard-access .dashboard-access-flex-container").length <= 0) {
                    clearInterval(learnerDashboardAccessListItemTimer);
                    
                    if ($("body.learn" + dashboardMainContentInner + " .widget--dashboard-access .dashboard-access-tabs").length > 0) {
                        $("body.learn.dashboard").hide();
                        window.location.reload(true);
                    }
                }
            }, 1000);
        }
    });
    /* TI dashboard SCORM continue button changes End */
});

domElementDetector("body.home.learning-path", () => {
    /* Sidebar title text for certification and learning path */
    const learningPathDetailSidebarCertificateTitle = "Certification";
    const learningPathDetailSidebarCertificateButtonText = "Start certification";
    const learningPathDetailSidebarLearningPathTitle = "Learning Path";

    /* Common learning path detail variable */
    const learningPathDetailHomeContent = ".learning-path .container .home__content";

    /* Appending learning path title below header */
    const learningPathDetailContainer = learningPathDetailHomeContent + " .course__detail__container";
    const learningPathDetailTitle = learningPathDetailHomeContent + " .course__detail__container .course__detail__content .h2";
    const learningPathDetailCustomTitlePath = learningPathDetailHomeContent + " .learning_path_title_container";
    
    domElementDetector(learningPathDetailContainer, () => {
        const learningPathDetailTitleValue = $(learningPathDetailTitle).text();
        const learningPathDetailCustomTitleHTML = `
            <div class="learning_path_title_container">
                <span class="learning_path_title_value">
                    ${learningPathDetailTitleValue}
                </span>
            </div>
        `;

        if ($(learningPathDetailCustomTitlePath).length <= 0) {
            $(learningPathDetailCustomTitleHTML).insertBefore(learningPathDetailContainer);
        }
    });

    /* Function to append sidebar title certificate/learning path */
    const learningPathDetailSidebarTitleManager = (title) => {
        const learningPathDetailSidebar = learningPathDetailHomeContent + " .course__detail__container .course__detail__sidebar .layout__content--sidebar";

        let learningPathDetailCustomSidebarHTML = `
            <div class="learningpath_detail_sidebar_title_container">
                <div class="learningpath_detail_sidebar_title"> ${title} </div>
            </div>
        `;

        const learningPathDetailSidebarTitlePath = learningPathDetailHomeContent + " .course__detail__container .course__detail__sidebar .layout__content--sidebar .learningpath_detail_sidebar_title_container";
        domElementDetector(learningPathDetailSidebar, () => {
            if ($(learningPathDetailSidebarTitlePath).length <= 0) {
                $(learningPathDetailSidebar).prepend(learningPathDetailCustomSidebarHTML);
            }
        });

    };

    /* Logic to decide learning path or certificate */
    const learningPathMilestonePath = learningPathDetailHomeContent + " .course__detail__container .course__detail__content .collection__courses .learning-path-detail-milestone-list > li";
    
    domElementDetector(learningPathMilestonePath, () => {
        const milestoneCount = $(learningPathMilestonePath).length;

        if (milestoneCount > 1) {
            // More than one milestone means it is a Certificate
            /* Appending title in sidebar in case of certificate */
            learningPathDetailSidebarTitleManager(learningPathDetailSidebarCertificateTitle);

            /* Changing button text in case of certificate */
            const learningPathDetailSidebarButton = learningPathDetailHomeContent + " .course__detail__container .course__detail__sidebar .layout__content--sidebar .widget--learning-path-purchase .enroll .btn";

            domElementDetector(learningPathDetailSidebarButton, () => {
                $(learningPathDetailSidebarButton).text(learningPathDetailSidebarCertificateButtonText);
            });
        } else {
            // Single milestone means it is a Learning path
            /* Appending title in sidebar in case of learning path */
            learningPathDetailSidebarTitleManager(learningPathDetailSidebarLearningPathTitle);
        }
    });

    /* Appending horizontal line before and after sidebar button */
    const learningPathDetailSidebarButton = learningPathDetailHomeContent + " .course__detail__container .course__detail__sidebar .layout__content--sidebar .widget--learning-path-purchase .enroll .btn";
    const learningPathDetailSidebarHorizontalline = `<hr class="learning_path_sidebar_horizontal_line">`;
    const learningPathDetailSidebarEnroll = learningPathDetailHomeContent + " .course__detail__container .course__detail__sidebar .layout__content--sidebar .widget--learning-path-purchase .enroll";
    
    domElementDetector(learningPathDetailSidebarButton, () => {
        let horizontalLineBoolean = $(learningPathDetailSidebarEnroll).html().includes('learning_path_sidebar_horizontal_line');

        if (!horizontalLineBoolean) {
            $(learningPathDetailSidebarHorizontalline).insertBefore(learningPathDetailSidebarButton);
            $(learningPathDetailSidebarHorizontalline).insertAfter(learningPathDetailSidebarButton);
        }
    })
});

domElementDetector("body.learn.course", () => {
    /* Common variables */
    const learnerSidebarExpandables = ".course .course__container .learner__container .learner__sidebar .layout-panel .learner__sidebar__expandables";

    /* Make content overflow if it exceeds height of 275px */
    domElementDetector(learnerSidebarExpandables, () => {
        $(learnerSidebarExpandables).find(".ember-view").eq(0).find(".expandable-sidebar__link").eq(0).css("display", "none");

        if ($(learnerSidebarExpandables).find(".ember-view").eq(0).height() > 250) {
            $(learnerSidebarExpandables).find(".ember-view").eq(0).css({ "height": "250px", "overflow-y": "scroll" });
        }
    });
    
    /* Intial page load kaltura video function call */
    $(document).ready(function() {
        generateKalturaVideo();
    });
});

domElementDetector("body.learn.learning-path", () => {
    const learningPathViewCourseLabel = "View course";
    const learningPathDashboardLinkText = "Learning Dashboard";
    const learningPathViewCoursePageUrl = window.location.pathname;
    const learningPathViewCoursePageUrlArr = learningPathViewCoursePageUrl.split("/");

    let isLearningPathCertificate = false;

    const learningPathCustomLayout = ".learning-path .container .learning-path_custom-layout";
    const learningPathTimelineMilestone = ".learning-path .container .learning-path-timeline .learning-path-timeline-milestone";

    updateTICourseDetails(
        learningPathViewCoursePageUrlArr[3],
        "title",
        learningPathCustomLayout + " .learning-path-page-header .widget__title"
    ); // update title based on the passing slug value of page

    const learningPathProgressBarItemsPath = learningPathCustomLayout + ".learning-pathways .learning-path-body--primary .medium-centered .learning-path-progress-bar-item .learning-path-progress-bar-item__index";
    
    domElementDetector(learningPathProgressBarItemsPath, () => {
        const learningPathProgressBarItems = $(learningPathProgressBarItemsPath).length;
        for (let learningPathProgressBarItemCount = 1; learningPathProgressBarItemCount < learningPathProgressBarItems; learningPathProgressBarItemCount++) {
            $(learningPathProgressBarItemsPath).eq(learningPathProgressBarItemCount).hide();
            $(learningPathProgressBarItemsPath).eq(learningPathProgressBarItemCount).parent().hide();
        }
    });

    // check whether page template is for Certificate or Learning Path
    const learningPathCheckRequiredFlagPath = learningPathCustomLayout + " .learning-path-timeline-milestone .learning-path-criterion-container .learning-path-criterion .learning-path-criterion__value-container";
    
    domElementDetector(learningPathCheckRequiredFlagPath, () => {
        const totalRequiredFlagCount = $(learningPathCheckRequiredFlagPath).find(".icon-signpost").length;
        const totalMilestoneCount = $(learningPathCustomLayout).find(".learning-path-timeline-milestone").length;
        
        if (totalMilestoneCount <= 1 && totalRequiredFlagCount <= 1) {
            // Learning pathways
            $(learningPathCustomLayout).addClass("learning-pathways");
            isLearningPathCertificate = false;
        } else {
            // Learning path certificate
            $(learningPathCustomLayout).addClass("learning-certificate");
            isLearningPathCertificate = true;
        }
    });

    const learningPathContentAssestPath = ".learning-path .container .learning-path-timeline-milestone-items";
    
    domElementDetector(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__content-container", () => {
        const learningPathProgressBarItemsPath = learningPathCustomLayout + " .learning-path-body--primary .medium-centered .learning-path-progress-bar-item.learning-path-progress-bar-item--current .learning-path-progress-bar-item__index";
        const learningPathContentContainerClass = $(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__content-container").eq(0).attr("class");
        const learningPathAssetContainerClass = $(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__asset-container").eq(0).attr("class");
        
        for (let learningPathProgressBarItemCount = 0; learningPathProgressBarItemCount < learningPathProgressBarItemsPath.length; learningPathProgressBarItemCount++) {
            $(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__content-container").eq(learningPathProgressBarItemCount).css({"float": "right"});
            $(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__content-container").eq(learningPathProgressBarItemCount).attr("class", learningPathContentContainerClass);
            $(learningPathContentAssestPath + " .learning-path-timeline-milestone-item__asset-container").eq(learningPathProgressBarItemCount).attr("class", learningPathAssetContainerClass);
        }
    });

    // Learning path - Adding course name at top of the series section
    const learningPathRowsCourseNameContainerPath = learningPathTimelineMilestone + " .learning-path-timeline-milestone-items .learning-path-timeline-milestone-item";
    
    domElementDetector(learningPathRowsCourseNameContainerPath, () => {
        const learningPathMilestoneLength = $(learningPathTimelineMilestone).length;

        for (let learningPathMilestoneCount = 0; learningPathMilestoneCount < learningPathMilestoneLength; learningPathMilestoneCount++) {
            
            if ($(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-course-name").length <= 0) {
                const learningPathMilestoneContentPath = $(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-items .learning-path-timeline-milestone-item");
                const learningPathMilestoneContentLength = learningPathMilestoneContentPath.length;

                for (let learningPathMilestoneContentCount = 0; learningPathMilestoneContentCount < learningPathMilestoneContentLength; learningPathMilestoneContentCount++) {
                    const learningPathMilestoneContentClosestParent = $(learningPathMilestoneContentPath).eq(learningPathMilestoneContentCount).find(".learning-path-milestone-item__title").closest(".learning-path-timeline-milestone-item")
                    
                    const learningPathElectiveRequiredTitle = $(learningPathMilestoneContentPath).eq(learningPathMilestoneContentCount).find(".learning-path-timeline-milestone-item__content").html();
                    
                    if (!$(learningPathMilestoneContentClosestParent).prev().is(".learning-path-milestone-item__title")) {
                        $(learningPathElectiveRequiredTitle).detach().insertBefore(learningPathMilestoneContentClosestParent);
                    }
                }
                
                $(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-item__content .catalog-item").html(`
                    <span>${learningPathViewCourseLabel}</span>
                    <span aria-hidden="true" class="Link-icon"><img class="Icon Icon--s" alt="" src="${forgeRightArrowIcon}"></span>
                `);
                
                $(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-item__content .btn--primary").html(`
                    <span>${learningPathViewCourseLabel}</span>
                    <span aria-hidden="true" class="Link-icon"><img class="Icon Icon--s" alt="" src="${forgeRightArrowIcon}"></span>
                `);
            }

            // if it is certificate template then move 0/1 text prev of required label
            if (isLearningPathCertificate) {
                const learningPathHeaderCriteriaContainerPath = $(learningPathCustomLayout + " .learning-path-timeline-milestone__header .learning-path-timeline-milestone__header-criterion .learning-path-criterion-container").eq(learningPathMilestoneCount).find(".learning-path-criterion__value-container");
                const learningPathMilestoneBadgePath = $(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-items .learning-path-milestone__badge").eq(0);

                $(learningPathHeaderCriteriaContainerPath).detach().insertBefore(learningPathMilestoneBadgePath);

                $(learningPathTimelineMilestone).eq(learningPathMilestoneCount).find(".learning-path-timeline-milestone-items .learning-path-milestone__badge:not(:first)").hide();
            }
        }
    });

    // Learning path move footer certificate container div next to "widget--milestones_standard"
    const learningPathCertificateContainerPath = learningPathCustomLayout + " .widget--milestones.widget--milestones_standard .learning-path-certificate-container";
    
    domElementDetector(learningPathCertificateContainerPath, () => {
        // check if next sibling is not exist then do insertAfter
        if (!$(learningPathCustomLayout + " .widget--milestones.widget--milestones_standard").next().is(".learning-path-certificate-container-parent")) {
            const learningPathCertificateContainer = "<div class='learning-path-certificate-container-parent'>" + $(learningPathCertificateContainerPath).get(0).outerHTML + "</div>";
            $(learningPathCertificateContainer).insertAfter(learningPathCustomLayout + " .widget--milestones.widget--milestones_standard");
            $(learningPathCertificateContainerPath).hide();
        }
    });

    // Learning path single milestone module/content count
    const learningPathMilestoneCountingPath = ".learning-path .container .learning-pathways .learning-path-timeline-milestone-items";
    
    domElementDetector(learningPathMilestoneCountingPath, () => {
        const learningPathMilestoneCount = $(learningPathMilestoneCountingPath + " .learning-path-timeline-milestone-item-circle").length;
    
        for (let learningPathMilestoneCounter = 0; learningPathMilestoneCounter < learningPathMilestoneCount; learningPathMilestoneCounter++) {
            $(learningPathMilestoneCountingPath + " .learning-path-timeline-milestone-item-circle").eq(learningPathMilestoneCounter).html(`
                <span class="learning-path-timeline-milestone-item-circle-count">${learningPathMilestoneCounter + 1}</span>
                <span class="learning-path-timeline-milestone-item-circle-svg-tick-icon">${forgeTickSvgIcon}</span>
            `);
        }
    });

    // Learning path certificate milestone count
    const learningCertificateMilestoneContainerPath = ".learning-path .container .learning-certificate .learning-path-timeline-milestone .learning-path-timeline-milestone-items";
    
    domElementDetector(learningCertificateMilestoneContainerPath, () => {
        const learningCertificateMilestoneContainerLength = $(learningCertificateMilestoneContainerPath).length;
        
        for (let learningCertificateMilestoneContainerCounter = 0; learningCertificateMilestoneContainerCounter < learningCertificateMilestoneContainerLength; learningCertificateMilestoneContainerCounter++) {
            const learningCertificateMilestoneCountingPath = $(learningCertificateMilestoneContainerPath).eq(learningCertificateMilestoneContainerCounter).find(".learning-path-timeline-milestone-item");
            const learningCertificateMilestoneModuleCount = learningCertificateMilestoneCountingPath.length;

            for (let learningCertificateMilestoneModuleCounter = 0; learningCertificateMilestoneModuleCounter < learningCertificateMilestoneModuleCount; learningCertificateMilestoneModuleCounter++) {
                const learningPathMilestoneCountHTML = learningCertificateMilestoneModuleCounter <= 0 ? `<span class="learning-path-timeline-milestone-count">${learningCertificateMilestoneContainerCounter + 1}</span>` : '';
                const learningPathMilestoneCircleTickIcon =  learningCertificateMilestoneModuleCounter <= 0 ? `<span class="learning-path-timeline-milestone-circle-svg-tick-icon">${forgeTickSvgIcon}</span>` : ``;

                $(learningCertificateMilestoneCountingPath).eq(learningCertificateMilestoneModuleCounter).find(".learning-path-timeline-milestone-item-circle").eq(0).html(`
                    ${learningPathMilestoneCountHTML}
                    ${learningPathMilestoneCircleTickIcon}
                    <span class="learning-path-timeline-milestone-item-circle-svg-tick-icon">${forgeTickSvgIcon}</span>
                `);

                if (learningCertificateMilestoneModuleCounter > 0) {
                    $(learningCertificateMilestoneCountingPath).eq(learningCertificateMilestoneModuleCounter).find(".learning-path-timeline-milestone-item-circle").eq(0).css({"background": "none", "border": "none"});
                    
                    if ($(learningCertificateMilestoneCountingPath).eq(learningCertificateMilestoneModuleCounter).prev().is(".learning-path-milestone-item__title")) {
                        $(learningCertificateMilestoneCountingPath).eq(learningCertificateMilestoneModuleCounter).prev().css({"border-top": "none"});
                    }
                }
            }
        }
    });

    // Learning path content description
    const learningPathMilestoneContentDescPath = learningPathCustomLayout + " .learning-path-milestone-item__alt-description";
    
    domElementDetector(learningPathMilestoneContentDescPath, () => {
        const learningPathMilestoneContentDescCounter = $(learningPathMilestoneContentDescPath).length;
        
        for (let learningPathMilestoneContentDescCount = 0; learningPathMilestoneContentDescCount < learningPathMilestoneContentDescCounter; learningPathMilestoneContentDescCount++) {
            $(learningPathMilestoneContentDescPath).eq(learningPathMilestoneContentDescCount).find("p").eq(0).css({"margin-bottom": "16px"});
            $(learningPathMilestoneContentDescPath).eq(learningPathMilestoneContentDescCount).find("p").eq(1).css({"margin-bottom": "48px"});
        }
    });

    const learningPathMilestoneCompletionCriteriaPath = ".learning-path .container .learning-path-timeline-milestone__header .learning-path-timeline-milestone__header-content .learning-path-timeline-milestone__subtitle";
    
    domElementDetector(learningPathMilestoneCompletionCriteriaPath, () => {
        const learningPathMilestoneHeaderCriteriaPath = ".learning-path .container .learning-path-timeline-milestone__header .learning-path-timeline-milestone__header-criterion .learning-path-criterion";
        $(learningPathMilestoneCompletionCriteriaPath).detach().appendTo(learningPathMilestoneHeaderCriteriaPath);

        if (isLearningPathCertificate === false) {
            const learningPathCriteriaContainerPath = learningPathCustomLayout + " .learning-path-timeline-milestone__header .learning-path-timeline-milestone__header-criterion .learning-path-criterion-container";
            const learningPathCertificateContainerPath = learningPathCustomLayout + " .learning-path-body .medium-centered.columns .learning-path-progress-bar-item--certificate-container .learning-path-certificate-container__progress-item";
            $(learningPathCriteriaContainerPath).detach().appendTo(learningPathCertificateContainerPath);
        }
    });

    const learningPathProgressBarItemPath = learningPathCustomLayout + ".learning-pathways .learning-path-body .learning-path-progress-bar-item";
    
    domElementDetector(learningPathProgressBarItemPath, () => {
        $(learningPathProgressBarItemPath).eq(0).css({"width": "unset"});
    });

    const learningPathProgressBarCertificateContainerPath = learningPathCustomLayout + " .learning-path-body .medium-centered.columns .learning-path-progress-bar-item--certificate-container";
    
    domElementDetector(learningPathProgressBarCertificateContainerPath, () => {
        $(learningPathProgressBarCertificateContainerPath).last().addClass("top-nav-learning-certificate-container");
    });

    const learningPathCertificationStatus = learningPathCustomLayout + " .learning-path-certificate-container-parent .learning-path-certificate-container .learning-path-certificate-status";
    
    domElementDetector(learningPathCertificationStatus, () => {
        $(learningPathCertificationStatus).append(`
            <div class="learning-path-certificate-status-dashboard-container">
                <a class="learning-path-certificate-status-dashboard-link" href="/learn/dashboard">
                    <span>${learningPathDashboardLinkText}</span>
                    <span aria-hidden="true" class="Link-icon"><img class="Icon Icon--s" alt="" src="${forgeRightArrowIcon}"></span>
                </a>
            </div>
        `)
    });

    const learningPathMilestoneItemDescription = learningPathCustomLayout + " .learning-path-timeline-milestone-item .learning-path-timeline-milestone-item__content .learning-path-milestone-item__description";
    
    domElementDetector(learningPathMilestoneItemDescription, () => {
        // translating course/event description html tags as per html rendering
        // removing displaying of html tags and render them to appear actual html
        const learningPathMilestoneItemDescriptionLength = $(learningPathMilestoneItemDescription).length;
        
        for (let learningPathMilestoneItemDescriptionCount = 0; learningPathMilestoneItemDescriptionCount < learningPathMilestoneItemDescriptionLength; learningPathMilestoneItemDescriptionCount++) {
            const learningPathMilestoneItemDescriptionText = $(learningPathMilestoneItemDescription).eq(learningPathMilestoneItemDescriptionCount).text();

            $(learningPathMilestoneItemDescription).eq(learningPathMilestoneItemDescriptionCount).html(learningPathMilestoneItemDescriptionText);
        }
    });

    /* TI learning path SCORM view course button changes Start */
    $(document).on("click", $(learningPathCustomLayout +  " .learning-path-timeline-milestone-item .learning-path-timeline-milestone-item__content .catalog-item"), function(event) {
        if (event && event.target && (event.target.href === "#" || event.target.href === undefined) && event.target.innerText.toLowerCase() === "view course") {
            const learningPathTimelineMilestoneScormTimer = setInterval(() => {
                const learningPathScormCoursePath = learningPathCustomLayout + " .learning-path-certificate-container-parent .learning-path-certificate-container";
                const isScormCourseParentPageReloadIssue = (
                    $(learningPathScormCoursePath).is(':visible') === false || 
                    $(learningPathScormCoursePath + " .learning-path-certificate-status-dashboard-container .learning-path-certificate-status-dashboard-link").length <= 0
                );
                const isLearningPathCertificatePage = window.location.href.includes(TI_LEARNING_PATH_CERTIFICATE_PAGE_PATH);
                
                if (isLearningPathCertificatePage && isScormCourseParentPageReloadIssue) {
                    clearInterval(learningPathTimelineMilestoneScormTimer);
                    $("body.learn.learning-path").hide();
                    window.location.reload(true);
                }
            }, 1000);
        }
    });
    /* TI learning path SCORM view course button changes End */

    /* TI learning path and certificate view course button click and add current url into session storage Start */
    const learningPathCertificateCatalogItemPath = learningPathTimelineMilestone + " .learning-path-timeline-milestone-items .learning-path-timeline-milestone-item .catalog-item";
    domElementDetector(learningPathCertificateCatalogItemPath, () => {
        const learningPathCertificatePageURL = window.location.href;

        $(document).on("click", learningPathCertificateCatalogItemPath, () => {
            sessionStorage.setItem(TI_LAST_VISITED_REFERRER_COOKIE_NAME, JSON.stringify({source: learningPathCertificatePageURL}));
        });
    });
    /* TI learning path and certificate view course button click and add current url into session storage End */

    $(document).ready(function() {
        // Reload page when user click on Enroll button on view course button link of learning-path/certificate page
        const learningPathSelectSessionEnrollPath = ".learning-path .container .learning-path-milestone-item-session-select__footer .btn";
        
        domElementDetector(learningPathSelectSessionEnrollPath, () => {
            $(learningPathSelectSessionEnrollPath).eq(0).on("click", () => {
                const learningPathMilestoneItemTitle = learningPathTimelineMilestone + " .learning-path-timeline-milestone-items .learning-path-milestone-item__title";
                const learningPathSelectSessionEnrollPathTimer = setInterval(() => {
                    const isMilestoneItemTitleVisible = $(learningPathMilestoneItemTitle).is(":visible");
                    
                    if (!isMilestoneItemTitleVisible) {
                        // something is missing or some UI gets distorted after clicking on Enrol Now button in popup so reload the page to make it correct
                        manageUserInterfaceDistorting();
                        clearInterval(learningPathSelectSessionEnrollPathTimer);
                        
                        setTimeout(() => {
                            window.location.reload(true);
                        }, 1000);
                    }
                }, 100);
            });
        });
    });
});

domElementDetector("body.learn.course", () => {
    /* Common variables paths */
    const topicContent = ".course .course__container .learner__container .learner__content .layout-panel .topic__container .topic__content";
    const questionContainer = topicContent + " .quiz__container .question__container";
    const quizContainer = topicContent + " .quiz__container";

    /* Appending quiz overlay in case it is not present in body tag */
    const courseBodyContainer = ".course";
    const quizOverlayHTML = `<div class="quiz__overlay"></div>`;

    domElementDetector(questionContainer, () => {
        const quizOverlayBoolean = $(courseBodyContainer).html().includes("quiz__overlay");

        if (!quizOverlayBoolean) {
            domElementDetector(questionContainer, () => {
                setTimeout(() => {
                    $(courseBodyContainer).append(quizOverlayHTML);
                }, 10);
            });
        }
    });

    let certificationAssessmentQuestionContainerRebind = () => {
        /* Appending quiz timer after question body */
        const questionBodyContainer = quizContainer + " .question__container  .question__body";
        const questionQuizTimer = quizContainer + " .quiz__timer";

        domElementDetector(questionBodyContainer, () => {
            $(questionQuizTimer).detach().insertAfter(questionBodyContainer);
        });

        /* Appending grade index after question container */
        let questionGradeIndex = quizContainer + " .topic__index";
        let questionQuizList = quizContainer + " .question__container .choices__list";
        let questionTopicIndexContainer = quizContainer + " .topic__index";
        let questionTopicIndex = quizContainer + " .topic__index .topic__index__number";
        let questionTopicActiveIndex = quizContainer + " .topic__index .topic__index__number--active";
        let questionTopicIndexTooMany = quizContainer + " .topic__index.topic__index--too-many";

        domElementDetector(questionGradeIndex, () => {
            if ($(quizContainer + " .topic__index--too-many").length <= 0) {
                // if question count < 30 then multiple boxes/dashes will appear instead of 1/30
                $(questionGradeIndex).detach().insertAfter(questionQuizList);
            } else {
                // if question count >= 30 then regular 1/30 format will appear
                if ($(quizContainer + " .question__container .topic__index--too-many").length <= 0) {
                    $(quizContainer + " > .topic__index--too-many").clone().insertAfter(questionQuizList);
                }

                domElementContentChangeDetector($(quizContainer + " > .topic__index--too-many").get(0), () => {
                    if ($(quizContainer + " .question__container .topic__index--too-many").length <= 0) {
                        $(quizContainer + " > .topic__index--too-many").clone().insertAfter(questionQuizList);
                    }
                });
                
                questionGradeIndex = quizContainer + " > .topic__index";
                questionTopicIndexContainer = quizContainer + " > .topic__index";
                questionTopicIndex = quizContainer + " > .topic__index .topic__index__number";
                questionTopicActiveIndex = quizContainer + " > .topic__index .topic__index__number--active";
                questionTopicIndexTooMany = quizContainer + " > .topic__index.topic__index--too-many";
            }
        });

        /* Topic index custom implementation */
        const questionContainerButton = quizContainer + " .question__container .btn";
        const questionCustomTopicIndex = quizContainer + " .question__container .topic_custom_index";
        let questionIndexCount = 0;
        let questionIndexTotalCount = 0;

        /* Generic function to get the question index */
        let certificationAssessmentIndexManager = (type) => {
            switch (type) {
                case "topicIndex":
                    questionIndexCount = $(questionTopicActiveIndex).text();
                    let indexCount = 0;

                    $(questionTopicIndex).each(function (index, item) {
                        indexCount = indexCount + 1;
                    });

                    questionIndexTotalCount = indexCount;
                    appendCustomTopicIndexHTML(questionIndexCount, questionIndexTotalCount);
                    break;
                case "topicManyIndex":
                    const questionIndexValue = $(questionTopicIndexTooMany).text();
                    const questionIndexValueArray = questionIndexValue.split("/");

                    appendCustomTopicIndexHTML(questionIndexValueArray[0], questionIndexValueArray[1]);
                    break;
            }

            domElementDetector(questionContainerButton, () => {
                bindQuestionButtonEvent();
            });
        };

        /* Function to bind button click event into DOM */
        let bindQuestionButtonEvent = () => {
            $(questionContainerButton).on("click", function () {
                let certificationAssessmentIndexDetector = () => {
                    const certificationAssessmentIndexDetectorTimeInterval = setInterval(() => {
                        let defaultIndex = 0;
                        let customIndex = 0;

                        if ($(questionTopicIndex).length > 0) {
                            defaultIndex = parseInt($(questionTopicActiveIndex).text());
                            let customIndexArray = $(questionCustomTopicIndex).text().split("/");

                            customIndex = parseInt(customIndexArray[0]);
                        }

                        if ($(questionTopicIndexTooMany).length > 0) {
                            const questionIndexValue = $(questionTopicIndexTooMany).text();
                            const questionIndexValueArray = questionIndexValue.split("/");

                            defaultIndex = parseInt(questionIndexValueArray[0]);
                            let customIndexArray = $(questionCustomTopicIndex).text().split("/");
                            customIndex = parseInt(customIndexArray[0]);
                        }

                        if (defaultIndex > customIndex) {
                            /* In case of type 1 */
                            if ($(questionTopicIndex).length > 0) {
                                certificationAssessmentIndexManager("topicIndex");
                            }

                            /* In case of type 2 */
                            if ($(questionTopicIndexTooMany).length > 0) {
                                certificationAssessmentIndexManager("topicManyIndex");
                            }

                            clearInterval(certificationAssessmentIndexDetectorTimeInterval);
                        }
                    }, 100);
                };

                certificationAssessmentIndexDetector();
            });
        };

        /* Get index of type 1 on page load */
        domElementDetector(questionTopicIndex, () => {
            certificationAssessmentIndexManager("topicIndex");
        });

        /* Get index of type 2 on page load */
        domElementDetector(questionTopicIndexTooMany, () => {
            certificationAssessmentIndexManager("topicManyIndex");
        });

        /* Appending custom HTML for topic index */
        let appendCustomTopicIndexHTML = (current, count) => {
            const questionCustomTopicIndexHTML = `<div class="topic_custom_index">
                    ${current} / ${count}
             </div>`;

            if ($(questionCustomTopicIndex).length <= 0) {
                if ($(quizContainer + " > .topic_custom_index").length <= 0) {
                    $(questionCustomTopicIndexHTML).insertAfter(questionTopicIndexContainer);
                }
            } else if ($(questionCustomTopicIndex).length > 0) {
                $(questionCustomTopicIndex).replaceWith(questionCustomTopicIndexHTML);
            }
        };
    }

    certificationAssessmentQuestionContainerRebind();

    /* In case of time out rebind the js */
    let certificationAssessmentQuizContainerButtonRebind = () => {
        const startTestButton = quizContainer + " .quiz-start .quiz-start__content .quiz-start__text .quiz-start__sub-text .btn";

        domElementDetector(questionContainer, () => {
            domElementDetector(startTestButton, () => {
                $(startTestButton).on("click", function () {
                    certificationAssessmentQuestionContainerRebind();
                    certificationAssessmentQuizContainerButtonRebind();
                })
            });
        })
    };

    certificationAssessmentQuizContainerButtonRebind();

    /* Prepending grade status after question result grade */
    const questionGradeStatus = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats .question-results__grade .results__grade__status"
    const questionResultStatus = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats .question-results__grade .panel";

    domElementDetector(questionResultStatus, () => {
        $(questionResultStatus).prepend($(questionGradeStatus).detach());
    });

    /* Wrapping up two divs to apply flex */
    const questionStatsContainer = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats";
    const questionStatsTitle = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats .results__title";
    const questionStatsGrade = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats .row .question-results__grade";

    domElementDetector(questionStatsContainer, () => {
        $(questionStatsGrade).parent('.row').addClass('results__question-grade__container');
        $(questionStatsGrade).parent('.row').prepend($(questionStatsTitle).clone().removeClass().addClass("question_results__title"));
        $(questionStatsTitle).hide();
    });

    /* Getting text from grade and appending it to main container */
    const questionGradeContainer = quizContainer + " .quiz__results .question-stats__container .results__question-chart-timer .question-stats .results__question-grade__container";
    const quizResultsGrade = quizContainer + " .quiz__results .question-results__messages .question-results__grade-remaining"

    domElementDetector(quizResultsGrade, () => {
        $(questionGradeContainer).append($(quizResultsGrade + " .quiz__start__grade").clone());
        $(questionGradeContainer).append($(quizResultsGrade + " .quiz__start__attempts").clone());
        $(quizResultsGrade + " .quiz__start__grade").hide();
        $(quizResultsGrade + " .quiz__start__attempts").hide();
    });

    /* Update sidebar css on click of continue to next section */
    const questionSibebarContainerPath = ".course .course__container .sidebar__container";
    const questionBackgroundOverlay = ".course .course__container .completed-section__overlay";
    const questionNextPageButton = quizContainer + " .quiz__results .results__controls a.btn.btn--success";

    domElementDetector(questionNextPageButton, () => {
        $(questionNextPageButton).on("click", function () {
            $(questionSibebarContainerPath).css({ 'display': '' });
            $(questionBackgroundOverlay).css({ 'display': '' });
        });
    });
});

domElementDetector("body.learn.article", () => {
    /* Common path variables */
    const articleContainer = ".article .container";
    const articleSidebarPath = ".article .container .widget--topic-article-content .article-sidebar";
    const articlePanelSidebarPath = articleSidebarPath + " .panel--article-sidebar";
    const articleTypeLabel = "Document";
    const articleDescriptionLabel = "Description";

    /* Appending article title to container */
    const articleLayout = ".article .container .layout-panel";
    const articleTitlePath = ".article .container .widget--topic-article-content .article-sidebar img";
    const isArticleTitle = articleContainer + " .article_title_container";
    
    domElementDetector(articleTitlePath, () => {
        const articleTitleText = $(articleTitlePath).attr("alt");
        const articleTitleHTML = `
            <div class="article_title_container">
                <div class="article_title_value">${articleTitleText}</div>
            </div>
        `;

        if ($(isArticleTitle).length <= 0) {
            $(articleTitleHTML).insertBefore(articleLayout);
        }
    });

    /* Appending sidebar title for article */
    const articleSidebarTitle = articlePanelSidebarPath + " .article_sidebar_title";
    
    domElementDetector(articlePanelSidebarPath, () => {
        const articleTypeHTML = `<div class="article_sidebar_title">${articleTypeLabel}</div>`;

        if ($(articleSidebarTitle).length <= 0) {
            $(articlePanelSidebarPath).prepend(articleTypeHTML);
        }
    });

    /* Appending horizontal line above and below button in article */
    const articleHorizontalLineHTML = `<hr class="article_horizontal_line">`;
    const articleButtonPath = articlePanelSidebarPath + " .btn";
    const articleHorizontalLinePath = articlePanelSidebarPath + " .article_horizontal_line";
    
    domElementDetector(articleButtonPath, () => {
        if ($(articleHorizontalLinePath).length <= 0) {
            $(articleHorizontalLineHTML).insertBefore(articleButtonPath);
            $(articleHorizontalLineHTML).insertAfter(articleButtonPath);
        }
    });

    /* Appnding document details in sidebar */
    const articleDocDetailsPath = articlePanelSidebarPath + " .article_document_details";
    const articleDocDescriptionPath = articleContainer + " .widget--topic-article-content .article_document_description";
    
    domElementDetector(articlePanelSidebarPath, () => {
        const urlPathName = window.location.pathname;
        const urlPathNameArray = urlPathName.split('/');
        const docSlugValue = urlPathNameArray[3];

        if (docSlugValue) {
            let docDetailsHTML = "";
            let docDescriptionHTML = "";

            getCourseDetails(docSlugValue).then((data) => {
                let results = data.results;

                if (results.length > 0) {
                    /* Appending document details */
                    docDetailsHTML = `
                    <div class="article_document_details">
                        ${results[0].w_product_type ?
                            `<div class="document_details_item_container">
                            <p class="document_details_item">${results[0].w_product_type.raw}</p>
                            ${results[0].lc_docsize || results[0].lc_updatedon || results[0].lc_filetype ? `<span class="text_divider">•</span>` : ""}
                        </div>` : ''}

                        ${results[0].lc_docsize ?
                            `<div class="document_details_item_container">
                            <p class="document_details_item">${results[0].lc_docsize.raw}</p>
                            ${results[0].lc_updatedon || results[0].lc_filetype ? `<span class="text_divider">•</span>` : ""}
                        </div>` : ''}

                        ${results[0].lc_updatedon ?
                            `<div class="document_details_item_container">
                            <p class="document_details_item">${convertedDate(results[0].lc_updatedon.raw)}</p>
                            ${results[0].lc_filetype ? `<span class="text_divider">•</span>` : ""}
                        </div>` : ''}

                        ${results[0].lc_filetype ?
                            `<div class="document_details_item_container">
                            <p class="document_details_item">${(results[0].lc_filetype.raw).toString().toUpperCase()}</p>
                        </div>` : ''}
                    </div>`;

                    if ($(articleDocDetailsPath).length <= 0) {
                        $(docDetailsHTML).insertAfter(articleButtonPath);
                    }

                    /* Appending document description */
                    if (results[0].lc_docdetails !== undefined) {
                        docDescriptionHTML = `
                        <div class="columns medium-3 article_document_description">
                            <p class="article_document_description_title">${articleDescriptionLabel}</p>
                            <p class="article_document_description_value">${results[0].lc_docdetails.raw}</p>
                        </div>`;

                        if ($(articleDocDescriptionPath).length <= 0) {
                            $(docDescriptionHTML).insertAfter(articleSidebarPath);
                        }
                    }
                }
            });
        }
    });
});

domElementDetector("body.home.course-group", () => {
    const eventMeetingColumn = ".course-group .container .home__content .course__detail__container .course__detail__content .row .column";
    const eventMeetingCard = eventMeetingColumn + " .tabs-content.tabs-content--meetings .event-sidebar__content__container .event-sidebar__content .btn.event-sidebar__meeting";
    const eventMeetingTab = eventMeetingColumn + " .tabs .tab-title.tab-title--meetings";
    const courseDetailSidebarDropdown = ".course-group .container .session-dropdown-content .session-dropdown-option";
    const meetingTabManager = () => {
        domElementDetector(eventMeetingCard, () => {
            $(eventMeetingCard).get(0).click();
        });

        domElementDetector(eventMeetingTab, () => {
            $(eventMeetingTab).on("click", function () {
                meetingTabManager();
            });
        });
    }

    /* call to metting tab manager on page load */
    meetingTabManager();

    /* On click of dropdown options call the function */
    domElementDetector(courseDetailSidebarDropdown, () => {
        $(courseDetailSidebarDropdown).on("click", function (e) {
            meetingTabManager();
        });
    })
});

// TI Public Certificate view page template
var publicCertificateTemplatePath = "body.home.public-certificate .container";

domElementDetector(publicCertificateTemplatePath, () => {
    const publicCertificateTemplateColumnsPath = publicCertificateTemplatePath + " .home__content .row .columns";
    
    $(publicCertificateTemplateColumnsPath).eq(1).addClass("medium-8");
    $(publicCertificateTemplateColumnsPath).eq(1).removeClass("medium-6");
    $(publicCertificateTemplateColumnsPath).eq(2).addClass("medium-4");
    $(publicCertificateTemplateColumnsPath).eq(2).removeClass("medium-6");
    $(publicCertificateTemplateColumnsPath).eq(2).removeClass("shadow-sm");

    const publicCertificateTemplateHeadingPath = publicCertificateTemplatePath + " .home__content .heading";
    
    domElementDetector(publicCertificateTemplateHeadingPath, () => {
        const publicCertificateTemplateHeading = $(publicCertificateTemplateHeadingPath).text();
        const publicCertificateTemplateHeadingHTML = `
            <div class="course_title">
                <span class="course_title_value">
                    ${publicCertificateTemplateHeading}
                </span>
            </div>
        `;

        if ($(publicCertificateTemplatePath + " .course_title .course_title_value").length <= 0) {
            $(publicCertificateTemplateHeadingHTML).insertAfter(publicCertificateTemplatePath + " header");
            $(publicCertificateTemplateHeadingPath).hide();
        }
    });    
});
