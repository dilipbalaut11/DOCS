(function (global, $) {
    var PrintOptions =
    {
        // IMPORTANT: Please do not set DisableRadioAndCheck to true 
        //  for print to pdf. It will not work, if otherwise.
        PrintToPdf:
        {
            ShowTitle: true,
            ShowHeader: true,
            ShowPrintButton: false,
            RemoveLinks: false,
            DisplayInPopup: false,
            DisableRadioAndCheck: false,
            RemoveFilterLinks: false,
            DisplaySpanButtonAsText: true,
            RemoveActionToolbar: true,
            RemoveGridRadioAndCheckboxColumn: true,
            HeaderID: 'ctl00_lblPageHeader',
            ContainerID: 'containerInner',
            InnerMargin: '.containerInnerMargin',
            PrintClass: 'printPreview',
            CssStylePath: '/stylesheets/USMainStyles.css',
            BaseUrlFn: function () { return $('base[href]').attr('href'); },
            ShouldShowEffectiveDate: function (contentDocument) { return false; }
        },

        PrintPreview:
        {
            ShowTitle: true,
            ShowHeader: true,
            ShowPrintButton: true,
            RemoveLinks: true,
            DisplayInPopup: true,
            DisableRadioAndCheck: true,
            RemoveFilterLinks: true,
            DisplaySpanButtonAsText: true,
            RemoveActionToolbar: true,
            RemoveGridRadioAndCheckboxColumn: true,
            HeaderID: 'ctl00_lblPageHeader',
            ContainerID: 'containerInner',
            ContentFrame: 'ContentFrame',
            InnerMargin: '.containerInnerMargin',
            PrintClass: 'printPreview',
            CssStylePath: '/stylesheets/USPrintPreview.css',
            BaseUrlFn: function () { return location.href.substring(0, location.href.indexOf(location.pathname) + 1); },
            ShouldShowEffectiveDate: function (contentDocument) { return false; }
        },

        PayStatement:
        {
            ShowTitle: false,
            ShowHeader: true,
            ShowPrintButton: true,
            RemoveLinks: true,
            DisplayInPopup: true,
            DisableRadioAndCheck: true,
            RemoveFilterLinks: true,
            DisplaySpanButtonAsText: true,
            RemoveActionToolbar: true,
            RemoveGridRadioAndCheckboxColumn: true,
            HeaderID: 'ctl00_lblPageHeader',
            ContainerID: 'containerInner',
            ContentFrame: 'ContentFrame',
            InnerMargin: '.containerInnerMargin',
            PrintClass: 'printPreview',
            CssStylePath: '/stylesheets/USPrintPreview.css',
            BaseUrlFn: function () { return location.href.substring(0, location.href.indexOf(location.pathname) + 1); },
            ShouldShowEffectiveDate: function (contentDocument) { return false; }
        },

        YEGChecklistFrame:
        {
            ShowTitle: false,
            ShowHeader: true,
            ShowPrintButton: true,
            RemoveLinks: true,
            DisplayInPopup: true,
            DisableRadioAndCheck: true,
            RemoveFilterLinks: true,
            DisplaySpanButtonAsText: true,
            RemoveActionToolbar: true,
            RemoveGridRadioAndCheckboxColumn: false,
            CopyStylesFromOriginal: true,
            HeaderID: 'ctl00_lblPageHeader',
            ContainerID: 'containerInner',
            ContentFrame: 'ContentFrame',
            InnerMargin: '.container-fluid',
            PrintClass: 'printPreview',
            CssStylePath: '/stylesheets/USPrintPreview.css',
            BaseUrlFn: function () { return location.href.substring(0, location.href.indexOf(location.pathname) + 1); },
            ShouldShowEffectiveDate: function (contentDocument) { return false; }
        },

        MetaPrintPreview:
        {
            ShowTitle: true,
            ShowHeader: true,
            ShowPrintButton: true,
            RemoveLinks: true,
            DisplayInPopup: true,
            DisableRadioAndCheck: true,
            RemoveFilterLinks: true,
            DisplaySpanButtonAsText: true,
            RemoveActionToolbar: true,
            RemoveGridRadioAndCheckboxColumn: true,
            HeaderID: 'MetaHeader',
            ContainerID: 'MetaContainer',
            ContentFrame: 'ContentFrame',
            InnerMargin: '#MetaInnerContainer',
            PrintClass: 'container-fluid',
            CssStylePath: '/stylesheets/USPrintPreview.css',
            BaseUrlFn: function () { return location.href.substring(0, location.href.indexOf(location.pathname) + 1); },
            ShouldShowEffectiveDate: function (contentDocument) { return $("#metabuttonbar .usDatePickerSpan", contentDocument).size() > 0; }
        }
    };

    var jqPrint = {
        Options: null,
        _PrintButtonText: null,
        _PrintButtonTitle: null,
        _CloseButtonText: null,
        _CloseButtonTitle: null,
        _NoneSelectedText: null,

        EventNames: [
            'onclick', 'onkeypress', 'onblur', 'onfocus', 'onload', 'onerror', 'ondblclick',
            'onresize', 'onscroll', 'onunload', 'onprerender', 'onchange', 'onsubmit',
            'oncontextmenu', 'onmouseover', 'onmousemove', 'onmouseout', 'onmouseup', 'onmousedown',
            'onselectstart'
        ],

        SetupPrint: function (options) {
            jqPrint.Options = options != null ? options : PrintOptions.PrintToPdf;
            $(document).ready(jqPrint.FilterDocumentOnReady);
        },

        SetupPrintPreview: function (containerIdOrSource) {
            return WindowManager.popupJqPrintPreview('toolbar = no, status = no, resizable = yes, scrollbars = yes', "containerIdOrSource=" + containerIdOrSource + "!");
        },

        SetupLocalStrings: function () {
            //get localized strings from parent
            jqPrint._PrintButtonText = window.opener ? window.opener.lstrPrintButton : window.lstrPrintButton;
            jqPrint._PrintButtonTitle = window.opener ? window.opener.lstrPrintBtn : window.lstrPrintBtn;
            jqPrint._CloseButtonText = window.opener ? window.opener.lstrCloseButton : window.lstrCloseButton;
            jqPrint._CloseButtonTitle = window.opener ? window.opener.lstrCloseBtn : window.lstrCloseBtn;
            jqPrint._NoneSelectedText = window.opener ? window.opener.lstrNothingSelected : window.lstrNothingSelected;
        },

        // This method needs to be called by the child window after loading
        FilterDocumentInPopupWindow: function (containerIdOrSource, originalDocument, targetDocument, isAltDomain) {
            var options;
            if (containerIdOrSource === 'MetaPrintPreview')
                options = PrintOptions.MetaPrintPreview;
            else if(containerIdOrSource === 'PayStatement')	
                options = PrintOptions.PayStatement;
            else if (containerIdOrSource === 'YEGChecklistFrame')
                options = PrintOptions.YEGChecklistFrame;
            else if(containerIdOrSource == "modalWrapper")
                options = $.extend({}, PrintOptions.PrintPreview, { ContainerID: containerIdOrSource, ShowTitle: false, ShowHeader: false, HeaderID: "ctl00_Content_lblModalHeader" });
            else
                options = PrintOptions.PrintPreview;

            if (containerIdOrSource.indexOf('ReadMoreDialogMessage') != -1) {
                var viewID = containerIdOrSource.substring(21, containerIdOrSource.length);

                options.ContainerID = 'readMoreDialogBody' + viewID;
                options.InnerMargin = '.modal-body';
                options.ContentFrame = null;
            }

            jqPrint.SetupLocalStrings();

            var parentDocument = originalDocument || window.opener.document,
                contentFrame = isAltDomain ? $('[id$=DisplayContentIFrame]', parentDocument)[0] : $('#' + options.ContentFrame, parentDocument)[0],
                headerDocument = null,
                contentDocument = null,
                innerContainerSelector = "#" + options.ContainerID;

            // Iframe
            if (contentFrame != null) {
                headerDocument = contentDocument = getIframeContent(contentFrame);

                //no iframe
            } else {
                headerDocument = contentDocument = parentDocument;
            }

            // Help popup
            if (containerIdOrSource == "HelpPrintPreview") {
                parentDocument = headerDocument = window.opener.WindowManager.helpWindow.document;
                contentDocument = getIframeContent(parentDocument.getElementById("ctl00_Content_helpDocument"));
                innerContainerSelector = "body";
                // Popup lightbox, used in Notes and Updates Dialog
            } else if (containerIdOrSource == "PopupLightboxPrintPreview") {
                contentDocument = getIframeContent(parentDocument.getElementById("popupFrame"));
                headerDocument = getIframeContent(parentDocument.getElementById("popupFrame"));

                innerContainerSelector = ".containerInner";
                // Custom Content Div (CustomContentDiv)
            }
                // used by lightbox.js
            else if (containerIdOrSource == 'lightboxAspxFrame') {
                contentDocument = getIframeContent(parentDocument.getElementById("lightboxAspxFrame"));
                headerDocument = parentDocument.getElementById("CustomContentDiv");
            }
            else if (containerIdOrSource == "CustomContentDiv") {
                contentDocument = parentDocument;
                innerContainerSelector = "div#CustomContentDiv";
            } else if (containerIdOrSource == "CustomContentDiv2") {
                innerContainerSelector = "div#CustomContentDiv2";
                // Expanded Content boxes (PrintIFrameContent)
            } else if (containerIdOrSource == "MetaPrintPreview") {
                innerContainerSelector = "div#MetaContainer";
            } else if(containerIdOrSource == "modalWrapper"){
                contentDocument = headerDocument;
            }
            else if (containerIdOrSource != "" && containerIdOrSource.indexOf('ReadMoreDialogMessage') == -1 && containerIdOrSource != "PayStatement") {
                contentDocument = getIframeContent(headerDocument.getElementById(containerIdOrSource));
                if (!contentDocument) {
                    contentDocument = $(headerDocument).find("#ClassicFrame").contents().find("#" + containerIdOrSource).contents()[0];
                }
                innerContainerSelector = "body";
            }
            
            // Capture page title, header, and root
            var pageTitle = $('title', parentDocument).html(),
                employeeTitle = $('#bannerText', parentDocument).html(),
                pageHeader = $('#' + options.HeaderID, headerDocument).text(),
                $dummyRoot = $('<div>'), // Root necessary due to limitations in IE
                $body = $('body', targetDocument),
                effectiveDate = null;

            // Add print buttons, title, header, and container contents
            if (options.ShouldShowEffectiveDate(contentDocument)) {
                effectiveDate = jqPrint.GetEffectiveDate(contentDocument, contentDocument);
            }

            if (options.ShowPrintButton) {
                $dummyRoot.append(jqPrint.GetPrintButton(effectiveDate));
            }

            if (pageTitle && options.ShowTitle) {
                $dummyRoot.append('<h3>' + pageTitle + '</h3>');
            }

            if (employeeTitle) {
                $dummyRoot.append('<h2>' + employeeTitle + '</h2>');
            }

            if (pageHeader) {
                $dummyRoot.append('<h1>' + pageHeader + '</h1>');
            }

            // Take html from parent document and append it to the dummy root
            // (Necessary because IE doesn't allow DOM nodes from one document to be appended to another document)
            var $container = $(innerContainerSelector, contentDocument);
            $dummyRoot.append($container.html());

            // Remove script elements which are not used
            $dummyRoot.find("script").remove();

            //Notes: Remove formatting that includes padding:
            $dummyRoot.find(".notesTextBox").removeClass("notesTextBox");

            //Remove hidden elements:
            $dummyRoot.find(".hide,.printRemove").remove();

            $dummyRoot.find(".printRemoveOverflow").css('overflow', '');

            //Remove the show class from gridview
            $dummyRoot.find(".show").removeClass("show");

            // Filter each element
            jqPrint.FilterElement($dummyRoot, options, $(innerContainerSelector, contentDocument));

            $dummyRoot.find('.printInterpretHtml').each(function () {
                var $this = $(this),
                    html = $('<div>').html($this.text()).text();
                $this.empty().append(html);
            });

            // Append Header Styles 
            if (options && options.CopyStylesFromOriginal && contentDocument) {
                var newHead = document.getElementsByTagName("head")[0];
                var arrStyleSheets = contentDocument.getElementsByTagName("style");
                for (var i = 0; i < arrStyleSheets.length; i++) {
                    try {
                        newHead.appendChild(arrStyleSheets[i].cloneNode(true));
                    }  
                    catch (e) {
                        break;
                    }                  
		        }
            }

            // Append processed html
            $body.append($dummyRoot.children());

            // Fix inner margin
            var $innerMargin = $body.find(options.InnerMargin).addClass(options.PrintClass);
            if (options === PrintOptions.MetaPrintPreview) {
                $innerMargin.removeClass('row-fluid');
            }

            var checkLogoInterval;
            var checkLogo = function () {
                if ($('#companyLogo').css('list-style-image') != 'auto') {
                    $body.find('#companyLogo').each(function (i, elem) {
                        var url = $(this).css('list-style-image');
                        url = url.substring(4);
                        url = url.substring(0, url.length - 1);

                        // Chrome removes the quotes for you, IE leaves them attached.
                        if (url[0] == '"')
                            url = url.substring(1);

                        if (url[url.length - 1] == '"')
                            url = url.substring(0, url.length - 1);

                        $(this).replaceWith($('<img/>').attr({
                            id: elem.id,
                            src: url
                        }));
                    });
                    clearInterval(checkLogoInterval);
                }
            }
            if($('#companyLogo').length) {
                checkLogoInterval = setInterval(checkLogo, 100);
            }
        },

        FilterDocumentOnReady: function () {
            var options = jqPrint.Options;

            // This method can't be used in popup windows
            if (options.DisplayInPopup)
                return;

            // Capture page title, header, and root
            var pageLocation = options.BaseUrlFn();
            var root = parent.GlobalVars['RootVD'].substring(1);
            var pageTitle = $('title', window.top.document).html();
            var pageHeader = $('#' + options.HeaderID).html();
            var baseUrl = options.BaseUrl = pageLocation + root;

            // Setup head and body
            var container, head, body;

            container = $('#' + options.ContainerID).remove();
            body = $('body');
            body.children().remove();
            body.removeAttr('class');
            head = $('head');
            head.children().remove();

            // Add print buttons, title, header, and container contents
            if (options.ShowPrintButton)
                body.append(jqPrint.GetPrintButton());

            if (pageTitle != null && pageTitle != '')
                body.append('<h3>' + pageTitle + '</h3>');

            if (pageHeader != null && pageHeader != '')
                body.append('<h1>' + pageHeader + '</h1>');

            body.append(container.children());

            // Remove head and add print styles
            head.append("<link rel=\"stylesheet\" href=\"" + baseUrl + options.CssStylePath + "\" media=\"all\" />");
            head.append("<style type='text/css' media='all'>body { font-weight: 800; position: static; overflow: auto; height: auto; width: auto; }</style>");
            head.append("<style type='text/css' media='print'>body { margin: 0 0 10px 0; } .printButton { display: none; }</style>");
            head.append("<META HTTP-EQUIV=\"CACHE-CONTROL\" CONTENT=\"NO-STORE\">");
            head.append("<META HTTP-EQUIV=\"CACHE-CONTROL\" CONTENT=\"NO-CACHE\">");
            head.append("<META HTTP-EQUIV=\"PRAGMA\" CONTENT=\"NO-CACHE\">");
            head.append("<META HTTP-EQUIV=\"EXPIRES\" CONTENT=\"-1\">");

            // Filter each element
            jqPrint.FilterElement(body, options, container);
        },

        FilterElement: function (element, options, originalContainer) {
            options = options || {};
            if (element.is("div#MetaInnerContainer")) {
                jqPrint.FilterMetaElement(element, options, originalContainer);
                return;
            }

            $.each(jqPrint.EventNames, function (i, eventName) {
                if (element.attr(eventName)) {
                    element.attr(eventName, '');
                }
            });

            // Process tags
            var elementInfo = new jqPrint.ElementInfo(element);

            // Remove elements not used
            if (!element.is(".printable") && element.is("iframe,input[type='hidden'],input[type='password']")) {
                element.remove();
            }

            // FilterElement returns true - if current element's children can be searched
            //  false - if this is a leaf
            if (element.is("a") && element.parent().is("div[id$='_filteredBy']")) {
                jqPrint.TagHandlers.FilterLink(element, options, elementInfo);
                return;
            }

            if (element.is("a.buttonResizable")) {
                jqPrint.TagHandlers.SpanButton(element, options, elementInfo);
            }

            if (element.is("a") && element.attr("href")) {
                jqPrint.TagHandlers.Link(element, options, elementInfo);
            }

            if (element.is("input[id$='selectAllCheckBox']") &&
                (element.is("input[type='checkbox']") || element.is("input[type='radio']"))
                && element.parents().is("th:first-child")) {
                jqPrint.TagHandlers.GridRadioOrCheckboxSelectorColumn(element, options, elementInfo);
                return;
            }

            if (element.is("input[type='checkbox']") || element.is("input[type='radio']")) {
                element.prop("checked", getElementFromOriginalContainer(element, originalContainer).prop("checked"));
                jqPrint.TagHandlers.RadioOrCheckInput(element, options, elementInfo);
                return;
            }

            if (element.is("div.gridToolbar")) {
                jqPrint.TagHandlers.ActionToolbar(element, options, elementInfo);
                return;
            }

            if (element.is("input[type='image']")) {
                jqPrint.TagHandlers.ImageInput(element, options, elementInfo);
                return;
            }

            if (element.is("input[type='text']") || element.is("input[type='button']:not(.printButton)") ||
                element.is("input[type='submit']") || element.is("input[type='password']")) {
                element.val(getElementFromOriginalContainer(element,originalContainer).val());
                jqPrint.TagHandlers.TextBoxInputOrButton(element, options, elementInfo);
                return;
            }

            if (element.is('button:not(.printButton)')) {
                jqPrint.TagHandlers.HtmlButton(element, options, elementInfo);
            }

            if (element.is("select")) {
                if (element.data('chosen') === undefined) {
                    element.val(getElementFromOriginalContainer(element,originalContainer).val());
                    jqPrint.TagHandlers.DropDown(element, options, elementInfo);
                } else {
                    element.addClass('hide');
                }

                return;
            }

            if (element.is("span.dateInputContainer")) {
                jqPrint.TagHandlers.CalendarControl(element, options, elementInfo);
                return;
            }

            if (element.is("span.usDatePickerSpan")) {
                jqPrint.TagHandlers.USDatePickerControl(element, options, elementInfo, getElementFromOriginalContainer(element,originalContainer));
                return;
            }

            if (element.is("table.moverBox")) {
                jqPrint.TagHandlers.OptionMover(element, options, elementInfo);
                return;
            }

            if (element.is("textarea")) {
                var $originalTextArea = getElementFromOriginalContainer(element,originalContainer);
                if ($originalTextArea.length) {
                    if (element.hasClass("talentReview")) {
                        element.val($originalTextArea.val()).css('width', '100%');
                    } else {
                        element.val($originalTextArea.val()).width($originalTextArea[0].offsetWidth);
                    }
                }
                jqPrint.TagHandlers.TextArea(element, options, elementInfo);
                return;
            }

            if (element.is('div.chosen-drop')) {
                element.addClass('hide');
                return;
            }

            if (element.is('div.modal-body') && options.ContainerID == 'modalWrapper')
            {
                element.removeClass("modal-body");
                element.addClass(".modal-body {max-height: auto;}")
                return;
            }

            element.children().each(function () {
                jqPrint.FilterElement($(this), options, originalContainer);
            });
        },

        FilterMetaElement: function (element, options, originalContainer) {
            var elementInfo = new jqPrint.ElementInfo(element);

            if (element.is(".printButton"))
                return;

            $.each(jqPrint.EventNames, function (i, eventName) {
                if (element.attr(eventName)) {
                    element.attr(eventName, '');
                }
            });

            if (element.prop('style').display === 'none') {
                element.remove();
            } else if (element.is("select")) {
                jqPrint.MetaHandlers.HandleSelect(element, options, originalContainer);
            } else if (element.is(".grid-filter")) {
                jqPrint.MetaHandlers.HandleGrid(element, options, elementInfo);
            } else if (element.is('div.select2-container')) {
                jqPrint.MetaHandlers.HandleBusinessRule(element, options, elementInfo);
            } else if (element.is("a")) {
                jqPrint.MetaHandlers.HandleLink(element, options, elementInfo);
            } else if (element.is("button")) {
                jqPrint.MetaHandlers.HandleButton(element, options, elementInfo);
            } else if (element.is(".search-query") || element.is("i") || element.is(".add-on")) {
                jqPrint.MetaHandlers.HandleGridSearching(element, options, elementInfo);
            } else if (element.is("input") || element.is('textarea')) {
                jqPrint.MetaHandlers.HandleInput(element, elementInfo, originalContainer);
            } else if (element.is('div') && element.children().length == 0 && element.text().replace(/[ \t\r\n]+/g, "").length !== 0) {
                jqPrint.MetaHandlers.HandleEditValue(element, options, elementInfo);
            } else if (element.is('h2') && element.hasClass('banner')) {
                jqPrint.MetaHandlers.HandleBanner(element);
            } else if (element.is("span[data-bind*='codeSelector:']")) {
                jqPrint.MetaHandlers.HandleCodeSelector(element, options, originalContainer);
            } else if (element.is("span:not(:has(:not('label,br'))):has(label,br)")) { // a span that has only br's and labels (address)
                jqPrint.MetaHandlers.HandleAddressSpan(element, options, elementInfo);
            } else {
                if (element.is('.columnHeader')) {
                    jqPrint.MetaHandlers.HandleColumnHeader(element, options, elementInfo);
                }

                if (element.children("div").children("h2").size() ||
                   (element.is("div[class*='span']") && element.is(":not('div.span12')"))) {
                    element.css("margin-bottom", "34px");
                }

                if (element.next().is("div[data-section-title]")) {
                    element.css("margin-top", "34px");
                }

                element.children().each(function () {
                    jqPrint.FilterMetaElement($(this), options, originalContainer);
                });

                if (element.is('div') && element.children().length == 0 && element.text().replace(/[ \t\r\n]+/g, "").length === 0) {
                    element.remove();
                }
            }
        },

        GetPrintButton: function (effectiveDate) {
            var print = $('<div>')
                .addClass('floatR')
                .append(
                    $('<input type="button">')
                        .attr({
                            'id': 'printButton',
                            'class': 'printButton',
                            'value': jqPrint._PrintButtonText,
                            'title': jqPrint._PrintButtonTitle
                        })
                        .click(function () {
                            window.print();
                            window.close();
                        }))
                .append(
                    $('<input type="button">')
                        .attr({
                            'id': 'closeButton',
                            'class': 'printButton',
                            'value': jqPrint._CloseButtonText,
                            'title': jqPrint._CloseButtonTitle
                        })
                        .click(function () { window.close(); }));
            if (effectiveDate) {
                print = print.prepend(effectiveDate);
            }

            return print;
        },

        GetEffectiveDate: function (contentDocument, rootElement) {
            var $dummyRoot = $('<div>', contentDocument),
                parts = $('#metabuttonbar', rootElement).children(':not(.buttonContainer,img)');
            var label = $(parts[0], rootElement).clone().removeClass().addClass('control-label'),
                span = $(parts[1], rootElement).clone(true).removeClass();
            var input = span.find('input[type="text"]');
            input = $('<span/>', contentDocument).text(input.val()).addClass('effectiveDate');
            $dummyRoot.append(label).append(input);
            return $('<span/>').addClass('effectiveDateGroup').append($dummyRoot.html());
        },

        ElementInfo: function (element) {
            this.CssClass = element.attr('class') || '';
            this.HasCssClass = !!this.CssClass;
        },

        Spanify: function (text, elementInfo) {
            var $span = $(document.createElement('SPAN')).text(text);
            if (elementInfo && elementInfo.HasCssClass) {
                $span.addClass(elementInfo.CssClass);
            }

            return $span;
        },

        TagHandlers:
        {
            Link: function (element, options, elementInfo) {
                if (options.RemoveLinks) {
                    var $newLink = jqPrint.Spanify(element.text(), elementInfo);
                    element.replaceWith($newLink);
                } else {
                    if (element.attr('href').indexOf('javascript:') >= 0) {
                        element.attr('href', 'javascript:void(0);');
                    }
                }
            },

            FilterLink: function (element, options, elementInfo) {
                if (options.RemoveFilterLinks) {
                    element.remove();
                } else {
                    this.Link(element, options, elementInfo);
                }
            },

            OptionMover: function (element, options, elementInfo) {
                //creates a list of all selected items - removes everything else
                var ulWrapper = $('<ul>');
                var destSelect = $("select[id$='dest']", element);
                if (destSelect.get(0).options.length == 0) {
                    ulWrapper.append($('<li>').append($('<label>').text(jqPrint._NoneSelectedText).html()));
                } else {
                    $.each(destSelect.get(0).options, function (idx, option) {
                        ulWrapper.append($('<li>').append($('<label>').text(option.text).html()));
                    });
                }
                element.parent().replaceWith(ulWrapper);
            },

            DropDown: function (element, options, elementInfo) {
                var selectedValue = element.val();
                var selectedText = $('option[value="' + selectedValue + '"]', element).html();
                var newSelect = $('<span>')
                    .addClass('dropDownReplaced')
                    .html(selectedText);
                if (elementInfo.HasCssClass) {
                    newSelect.addClass(elementInfo.CssClass);
                }
                element.replaceWith(newSelect);
            },

            CalendarControl: function (element, options, elementInfo) {
                var outerContainer = element.parent();
                var innerContainer = $('.dateContainer', element);

                var newCalendar;
                if (innerContainer.size() > 0) {
                    $("input[type='text']", innerContainer).each(function () {
                        var datePart = $(this);
                        datePart.replaceWith(datePart.val());
                    });
                    newCalendar = jqPrint.Spanify(innerContainer.text(), elementInfo);
                } else {
                    newCalendar = jqPrint.Spanify(element.text(), elementInfo);
                }
                outerContainer.replaceWith(newCalendar);
            },

            USDatePickerControl: function (element, options, elementInfo, originalElement) {
                var originalInput = originalElement.find('input.usDatePickerTextBox'),
                    originalVal = originalInput ? originalInput.val() : undefined,
                    innerContainer = element.find('input.usDatePickerTextBox');
                innerContainer.val(originalVal);
                var replacement = jqPrint.Spanify(innerContainer.val(), elementInfo);

                element.replaceWith(replacement);
            },

            TextBoxInputOrButton: function (element, options, elementInfo) {
                var newTextInput = jqPrint.Spanify(element.val(), elementInfo);
                element.replaceWith(newTextInput);
            },

            ImageInput: function (element, options, elementInfo) {
                var newImgInput = $('<img>').attr('src', element.attr('src'));
                if (elementInfo.HasCssClass) newImgInput.addClass(elementInfo.CssClass);
                element.replaceWith(newImgInput);
            },

            RadioOrCheckInput: function (element, options, elementInfo) {
                if (options.DisableRadioAndCheck) {
                    element.attr('disabled', 'disabled');
                }
            },

            TextArea: function (element, options, elementInfo) {
                var newTextInput = jqPrint.Spanify(element.val(), elementInfo)
                    .css("display", "block")
                    .width(element.css('width'));
                element.replaceWith(newTextInput);
            },

            SpanButton: function (element, options, elementInfo) {
                if (options.DisplaySpanButtonAsText)
                    element.removeClass('buttonResizable');
            },

            HtmlButton: function (element, options, elementInfo) {
                var newElement = jqPrint.Spanify(element.text(), elementInfo);
                if (element.prop('disabled')) {
                    newElement.addClass('disabled-button');
                }

                element.replaceWith(newElement);
            },

            ActionToolbar: function (element, options, elementInfo) {
                if (options.RemoveActionToolbar)
                    element.remove();
            },

            GridRadioOrCheckboxSelectorColumn: function (element, options, elementInfo) {
                if (options.RemoveGridRadioAndCheckboxColumn) {
                    var thParent = element.parents("th");

                    //remove all selector td's
                    var tblParent = thParent.parents("table.grid");
                    $('td:first-child', tblParent).each(function () {
                        var currColspan = $(this).attr("colspan");
                        if (currColspan > 1) {
                            $(this).attr("colspan", --currColspan);
                        } else {
                            $(this).remove();
                        }
                    });
                    thParent.remove();
                }
            }
        },

        MetaHandlers: {
            HandleButton: function (element, options, elementInfo) {
                if (!element.is(".pagerCurrentLink")) {
                    element.remove();
                } else {
                    var replace = jqPrint.Spanify(element.get(0).childNodes[0].data);
                    element.replaceWith(replace);
                }
            },

            HandleLink: function (element, options, elementInfo) {
                if (element.attr('class') === 'select2-choice') {
                    var replacement = element.find('span').clone();
                    element.replaceWith(replacement);
                } else if (element.attr('href') === '#') {
                    element.remove();
                } else {
                    var text = element.text();
                    var replace = jqPrint.Spanify(text);
                    element.replaceWith(replace);
                }
            },

            HandleSelect: function (element, options, originalContainer) {
                // Get the slected option from the select in the original document (jQuery doesn't clone select values)
                var replacement = $('option:selected', getElementFromOriginalContainer(element,originalContainer));
                replacement = jqPrint.Spanify(replacement.text());
                element.replaceWith(replacement);
            },

            HandleGridSearching: function (element, options, elementInfo) {
                element.remove();
            },

            HandleInput: function (element, elementInfo, original) {
                var replacement,
                    check;
                // Elements without ids are useless in meta, but occur in legacy
                if (!element.attr('id') && !element.is('div.legacy-control input')) {
                    element.remove();
                } else if (element.is('input[type="checkbox"]')) {
                    if (element.attr("id")) {
                        check = getElementFromOriginalContainer(element,original).prop('checked');
                    } else if (element.is("span[id] > input")) { // Happens on change name and address grid {
                        check = $('#' + element.parent().attr('id') + " input[type='checkbox']", original).prop('checked');
                    }

                    if (check) {
                        element.attr('checked', 'checked');
                    } else {
                        element.removeAttr('checked');
                    }
                    element.attr('disabled', 'disabled');
                } else if (element.is('input[type="text"]')) {
                    replacement = jqPrint.Spanify(getElementFromOriginalContainer(element,original).val());
                    element.replaceWith(replacement);
                } else if (element.is('textarea')) {
                    replacement = $('<pre/>').text(getElementFromOriginalContainer(element,original).val());
                    element.replaceWith(replacement);
                } else {
                    element.remove();
                }
            },

            HandleEditValue: function (element, options, elementInfo) {
                element.wrapInner($('<span/>'));
            },

            HandleGrid: function (element, options, elementInfo) {
                element.remove();
            },

            HandleBanner: function (element, options, elementInfo) {
                element.removeClass('banner');
            },

            HandleColumnHeader: function (element, options, elementInfo) {
                element.removeClass('columnHeader');
            },

            HandleBusinessRule: function (element, options, elementInfo) {
                element.replaceWith($("<span>").text(element.text()));
            },

            HandleEmptyDiv: function (element, options, elementInfo) {
                element.css("display", "none");
            },

            HandleCodeSelector: function (element, options, originalContainer) {
                var elementWithValue = $('#' + element.attr("id").replace(/\$/g, "\\$"), originalContainer).find("select > option:selected,input[type='text']").eq(0);

                // Prefer text over val because text is what the user sees
                element.empty();
                element.text(elementWithValue.is("option") ? elementWithValue.text() : elementWithValue.val());
            },

            HandleAddressSpan: function (element, options, elementInfo) {
                element.css("top", "-17px");
            }
        }
    };

    function getIframeContent(contentFrame) {
        if (!contentFrame) {
            return null;
        }
        if (contentFrame.contentDocument) // DOM
            return contentFrame.contentDocument;
        else if (contentFrame.contentWindow) // IE win
            return contentFrame.contentWindow.document;
    }

    function getElementFromOriginalContainer(element, originalContainer) {
        //As of version 38.14393.0.0, Edge browser has a performance issue when selecting elements with 
        //jQuery when the context is specified (eg. $('#' + element.attr('id'), originalContainer) ). 
        //To workaround this issue, selecting is performed without jQuery when Edge is detected.
        if (isEdgeBrowser())
            return $(originalContainer[0].ownerDocument.getElementById(element.prop('id')));
        else if (element.attr('id'))
            return $('#' + element.attr('id').replace(/\:/g, "\\:"), originalContainer);
        else 
            return $('#' + element.attr('id'), originalContainer);
    }

    function isEdgeBrowser() {
        //Edge browser detection based on Microsoft documentation: https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
        return (/Edge\/\d./i.test(navigator.userAgent));
    }

    global.PrintOptions = PrintOptions;
    global.jqPrint = jqPrint;
})(window, window.jQuery);