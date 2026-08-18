'use strict';

/*------------------------------------------------

1. AOS init
2. Animsition init
3. Mobile menu
4. Fixed header
5. Project slider
6. Project carousel
  6.1 Filter carousel
7. Reviews carousel
8. Animation of statistics
9. Modal
10. Packery init
11. Pagepiling
12. Form validation
13. Fixed footer
14. Parallax slider
15. Home grid background

-------------------------------------------------*/

var body = $('body');
var DURATION = 300;
var preloader = $('.preloader');
var header = $('.header');
var mobileBreakpoint = 992;

function setOverlay(cb) {
	var overlay = $('<div class="overlay"></div>');
	overlay.on('click', cb);
	return overlay;
}

/* 1. AOS init */
$(window).on('load', function() {
	AOS.init({
		duration: 1000
	});
});

/* 2. Animsition init */
(function() {
	//$(document).ready(function() {
		$(".animsition").animsition({
			inClass: 'fade-in',
			outClass: 'fade-out',
			inDuration: 1500,
			outDuration: 1000,
			linkElement: '.animsition-link',
			// e.g. linkElement: 'a:not([target="_blank"]):not([href^="#"])'
			loading: true,
			loadingParentElement: 'body', //animsition wrapper element
			loadingClass: 'preloader',//'animsition-loading',
			loadingInner: `<div class="preloader__spinner">
				<span class="preloader__double-bounce"></span>
				<span class="preloader__double-bounce preloader__double-bounce--delay"></span>
			</div>`, // e.g '<img src="loading.svg" />
			timeout: false,
			timeoutCountdown: 5000,
			onLoadEvent: true,
			browser: [ 'animation-duration', '-webkit-animation-duration'],
			// "browser" option allows you to disable the "animsition" in case the css property in the array is not supported by your browser.
			// The default setting is to disable the "animsition" in a browser that does not support "animation-duration".
			overlay : false,
			overlayClass : 'animsition-overlay-slide',
			overlayParentElement : 'body',
			transition: function(url){ window.location.href = url; }
		});

		setTimeout(function(){
			//preloader.fadeOut(DURATION);
		}, 1000);

	//})
})();

/* 3. Mobile menu */
(function() {
	var menuOpenBtn = $('.menu-toggle');
	var menu = $('.__js_mobile-canvas');
	var menuCloseBtn = menu.find('.mobile-canvas__close');
	var headerContainer = $('.header .container');
	var animsition = $('.animsition');
	var isHandled = false;

	//var dropdownLinks = menu.find('.__js_menu-dropdown-link');
	var mobileDropdownLinks = $('.navigation__link');

	var ModifierClass = {
		MENU: 'mobile-canvas--opened',
		TOGGLE: 'menu-toggle--opened'
	};

	menuOpenBtn.on('click', function() {
		var overlay = setOverlay(closeMenu);//
		body.append(overlay);

		menuCloseBtn.on('click', closeMenu);
		menuOpenBtn.addClass(ModifierClass.TOGGLE);

		setTimeout(function() {
			overlay.fadeIn(DURATION);

			menu.addClass(ModifierClass.MENU);
		}, DURATION + 50);
	});

	if ($(window).width() >= mobileBreakpoint) {
		headerContainer.append(menu);
		menu.addClass('header__mobile');
	}

	if ($(window).width() < mobileBreakpoint) {
		mobileDropdownLinks.each(function() {
			if($(this).next().length !== 0) {
				$(this).removeClass('animsition-link');
			}
		});
	}

	if ($(window).width() < mobileBreakpoint && !isHandled) {
		mobileDropdownLinks.on('click', openMobileDropdown);
		isHandled = true;
	}

	$(window).on('resize', function() {
		if ($(window).width() >= mobileBreakpoint) {
			headerContainer.append(menu);
			menu.addClass('header__mobile');
		} else {
			animsition.prepend(menu);
			menu.removeClass('header__mobile');
		}

		if ($(window).width() < mobileBreakpoint && !isHandled) {
			mobileDropdownLinks.on('click', openMobileDropdown);
			isHandled = true;
		} else {
			mobileDropdownLinks.off('click', openMobileDropdown);
			isHandled = false;
		}


		if ($(window).width() < mobileBreakpoint) {
			mobileDropdownLinks.each(function() {
				if($(this).next().length !== 0) {
					$(this).removeClass('animsition-link');
				}
			});
		} else {
			mobileDropdownLinks.addClass('animsition-link');
		}
	})





	function openMobileDropdown(evt) {
		if ($(this).next().length !== 0) {
			evt.preventDefault();
			$(this).next().find('a[href]').on('click', closeMenu);
			$(this).next().slideToggle(DURATION);
		}
	}

	function closeMenu() {
		menuCloseBtn.off('click', closeMenu);
		menu.removeClass(ModifierClass.MENU);
		var overlay = $('.overlay').fadeOut(DURATION);

		setTimeout(function() {
			menuOpenBtn.removeClass(ModifierClass.TOGGLE);
			overlay.remove();
		}, DURATION + 50);
	}

	$(window).on('resize', function() {
		var windowWidth = $(window).width();

		if (windowWidth >= mobileBreakpoint) {
			closeMenu();
		}
	});
})();

/* 4. Fixed header */
(function() {
	var header = $('.__js_fixed-header');
	if (header.length) {
		var headerOffset = header.offset().top;
		var headerHeight = header.outerHeight();
	}
	var classes = 'header--fixed';
	var scroll = $(window).scrollTop();
	var isScroll = false;
	var isNotStatic = header.hasClass('header--half') && $(window).width() >= mobileBreakpoint ? true : false;

	$(window).on('scroll', function() {
		scroll = $(window).scrollTop();

		if (scroll >= headerOffset + headerHeight) {
			isScroll = true;

			headerHeight = isScroll ? header.outerHeight() : null;
			header.addClass(classes);

			if (!header.hasClass('is-fixed')) {
				header.css({'top': -headerHeight + 'px', 'transform': ' translateY(' + headerHeight + 'px)'}).addClass('is-fixed');

				if (!isNotStatic) {
					body.css('padding-top', headerHeight + 'px');
				}
			}
		} else {
			isScroll = false;
			header.removeClass(classes + ' is-fixed').removeAttr('style');
			body.css('padding-top', 0);

			if (!isNotStatic) {
				//body.css('padding-top', 0);
			}
		}
	});

	$(window).on('resize', function() {
		headerHeight = header.outerHeight();
		isNotStatic = header.hasClass('header--half') && $(window).width() >= mobileBreakpoint ? true : false;

		if (scroll >= headerOffset + headerHeight && isScroll) {
			header.css({'top': -headerHeight + 'px', 'transform': 'translateY(' + headerHeight + 'px)'});
			//body.css('padding-top', headerHeight + 'px');

			if (!isNotStatic) {
				body.css('padding-top', headerHeight + 'px');
			}
		}
	});
})();

/* 5. Project slider */
(function(){
	var projectsSlider = new Swiper('.__js_projects-slider', {
		slidesPerView: 'auto',
		spaceBetween: 30,
		loop: true,
		centeredSlides: true,
		navigation: {
			nextEl: '.projects-slider__next',
			prevEl: '.projects-slider__prev',
		},
	});
})();

/* 6. Project carousel */
(function(){
	var mySwiper = new Swiper('.__js_projects-carousel', {
		slidesPerView: 'auto',
		spaceBetween: 32,
		loop: false,

		navigation: {
			nextEl: '.projects-carousel__next',
			prevEl: '.projects-carousel__prev',
		},

		scrollbar: {
			el: '.swiper-scrollbar',
		},
	});

	var latestProjectsInHomeCarousel = new Swiper('.__js_latest-projects-carousel', {
		slidesPerView: 1,
		loop: false,
		breakpoints: {
			768: {
				slidesPerView: 2,
				spaceBetween: 15
			},
			992: {
				slidesPerView: 3,
				spaceBetween: 24
			},
			1200: {
				slidesPerView: 4,
				spaceBetween: 30
			},
		},

		pagination: {
			el: '.swiper-pagination',
			clickable: true
		},
	});

	/* 6.1 Filter carousel */
	$('.__js_latest-projects-filter-item').on('click', function() {
		var selector = $(this).attr('data-filter');

		$('.__js_latest-projects-carousel').fadeOut(DURATION);
		$('.__js_latest-projects-carousel').fadeIn(DURATION);

		setTimeout(function(){
			$('.__js_latest-projects-carousel .swiper-slide').hide();
			$(selector).closest('.__js_latest-projects-carousel .swiper-slide').show();

			latestProjectsInHomeCarousel.update();
		}, DURATION);

		return false;
	});
})();

/* 7. Reviews carousel */
(function() {
	var reviewCarousel = new Swiper('.__js_review-carousel', {
		slidesPerView: 1,
		loop: false,
		spaceBetween: 15,
		breakpoints: {
			768: {
				slidesPerView: 2,
				spaceBetween: 15
			},
			992: {
				slidesPerView: 2,
				spaceBetween: 30
			},
			1200: {
				slidesPerView: 2,
				spaceBetween: 60
			},
		},
		pagination: {
			el: '.swiper-pagination',
			clickable: true
		},
	});
})();

/* 8. Animation of statistics */
(function() {
	$(window).on('load', function() {
		var statistics = $('.statistics');
		var numbers = $('.__js_number');
		var animationIsDone = false;
		var scroll = $(window).scrollTop() + $(window).height();

		if ($('*').is('.statistics')) {
			var offset = statistics.offset().top;

			if (!animationIsDone && scroll >= offset) {
				animateNumbers();
			}

			$(window).on('scroll', function() {
				scroll = $(window).scrollTop() + $(window).height();

				if (!animationIsDone && scroll >= offset) {
					animateNumbers();
				}
			});
		}

		function animateNumbers() {
			numbers.each(function() {
				var endValue = parseInt($(this).attr('data-end-value'), 10);

				$(this).easy_number_animate({
					start_value: 0,
					end_value: endValue,
					duration: 2500
				});

			});

			animationIsDone = true;
		}
	});
})();

/* 9. Modal */
(function(){
	$(document).ready(function() {
		$(".fancybox").fancybox({
			margin: 0
		});
	});
})();

/* 10. Packery init */
(function() {
	$(window).on('load', function(){
		var filterItem = $('.filter__item');
		var filterItemAll = $('.filter__item[data-filter="*"]');
		var filterActiveClass = 'filter__item--active';

		var grid = $('.__js_projects-grid').isotope({
			itemSelector: '.__js_masonry-item',
			layoutMode: 'packery',
			getSortData: {
        order: '[data-order]',
      },
      sortBy: 'order',
      //sortAscending: false,
			packery: {
				gutter: 0
			},
		});

		var grid2 = $('.__js_news-grid').isotope({
			itemSelector: '.__js_masonry-item',
			layoutMode: 'packery',
			packery: {
				gutter: 0
			},
		});

		setTimeout(function () {
			$('.masonry').isotope({
				itemSelector: '.masonry-item',
				layoutMode: 'packery'
			});
		}, 100);

		filterItem.on('click', function() {
			var filterValue = $(this).attr('data-filter');

			$(this).addClass(filterActiveClass).siblings().removeClass(filterActiveClass);
			grid.isotope({ filter: filterValue });
			grid2.isotope({ filter: filterValue });

			if ($('.__js_news-list-filter') && $('.__js_news-list-filter').length > 0) {
				var destination = $('.__js_news-list-filter').offset().top - 200;

				$('html').animate({ scrollTop: destination }, 1100); //1100 - скорость
			}
		});
	});
})();

/* 11. Pagepiling */
(function(){
	initFullPage();

	if ($('#pagepiling .section.active').hasClass('dark')) {
		setDark();
	}

	function initFullPage() {
		if ($('#pagepiling') && $('#pagepiling').length > 0) {
			$('#pagepiling').pagepiling({
				scrollingSpeed: 280,
				loopBottom: true,
				afterLoad: function (anchorLink, index) {
					var current = $('#pagepiling .section.active');

					if (current.hasClass('dark')) {
						setDark();
					} else {
						removeDark();
					}

					if (current.hasClass('__js_bg')) {
						$('.header').addClass('header--bg');
						$('.footer').addClass('footer--bg');
					} else {
						$('.header').removeClass('header--bg');
						$('.footer').removeClass('footer--bg');
					}
					$('.fp-table.active .aos-init').addClass('aos-animate');
				}
			});
		}
	}

	function setDark() {
		$('.webpage').addClass('webpage--parallax-dark');
	}

	function removeDark() {
		$('.webpage').removeClass('webpage--parallax-dark');
	}


    //$.fn.pagepiling.setAllowScrolling(false, 'left, right');


})();

/* 12. Form validation */
(function(){
	function validateEmail(email) {
		var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
		return re.test(String(email).toLowerCase());
	}

	function mail(event, php) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
		var req = new XMLHttpRequest();
		req.open('POST', php, true);

		req.onerror = function () {
			console.log("Ошибка отправки запроса");
		};

		req.send(new FormData(event.target));
	}

	function checkValid(errs) {
		var isValid = true;

		errs.each(function () {
			if ($(this).is(':visible')) {
				isValid = false;
			}
		});

		return isValid;
	}

	$('.js-form-validate button').on('click', function (e) {
		var that = $(this),
				fields = $(this).parent().find('input').add($(this).parent().find('textarea')),
				form = $(this).parent('form'),
				isValid = checkValid(form.find('.field-error'));

		fields.each(function () {
			var err = $(this).parent().next();

			if ($(this).prop('required') === true) {
				if ($(this).val().length === 0) {
					err.show().text('Please enter a value.');
					isValid = false;
				} else {
					err.hide().text('');
				}
			}

			if ($(this).attr('type') === "email") {
				if (validateEmail($(this).val()) === false) {
					err.show().text('Please enter a valid email address.');
					isValid = false;
				}
			}
		});

		if (isValid) {
			form.submit(function () {
				mail(event, 'php/mail.php');

				$.fancybox.open({
					src: '#thanks',
					type: 'inline',
					touch: false,
					scrolling: 'no'
				});
			});

			setTimeout(function () {
				form.off('submit');
			}, 100);
		} else {
			e.preventDefault();
		}
	});

	$('.js-form-validate .field').on('focusout keyup change', function () {
		var input = $(this).find('input'),
				err = input.parent().next(),
				val = input.val();

		if (input.attr('type') === "email") {
			if (validateEmail(val) || val.length === 0) {
				err.hide().text('');
			} else {
				err.show().text('Please enter a valid email address.');
			}
		}
	});
})();

/* 13. Fixed footer */
(function() {

	$(window).on('load', function() {
		var footer = $('.__js_fixed-footer');
		var footerParent = footer.parent();
		var footerHeight = footer.innerHeight();

		if(footer.length !== 0) {
			if (footerHeight <= $(window).height()) {
				var leftValue = footerParent.css('padding-left');
				footer.css({ 'position': 'fixed', 'left': leftValue, 'right': '0', 'bottom': '0'});
				body.css('padding-bottom', footerHeight);
			} else {
				body.css('padding-bottom', '0');
				footer.removeAttr('style')
			}

			$(window).on('resize', function() {
				footerHeight = footer.innerHeight();

				if (footerHeight <= $(window).height()) {
					leftValue = footerParent.css('padding-left');
					footer.css({ 'position': 'fixed', 'left': leftValue, 'right': '0', 'bottom': '0'});
					body.css('padding-bottom', footerHeight);
				} else {
					body.css('padding-bottom', '0');
					footer.removeAttr('style');
				}
			});
		}
	});
})();

/* slider */
document.addEventListener("DOMContentLoaded", function () {

    const slides =
        document.querySelectorAll(".main-slide");

    const projectItems =
        document.querySelectorAll(".project-item");

    const prevButton =
        document.querySelector(".slider-arrow.prev");

    const nextButton =
        document.querySelector(".slider-arrow.next");

    const currentNumber =
        document.querySelector(".progress-current");

    const progressBar =
        document.querySelector(".progress-line span");

    let currentSlide = 0;

    let autoSlide;


    /* =====================================================
       SHOW SLIDE
    ===================================================== */

    function showSlide(index) {

        if (index >= slides.length) {
            index = 0;
        }

        if (index < 0) {
            index = slides.length - 1;
        }

        currentSlide = index;


        /* SLIDES */

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === currentSlide
            );

        });


        /* PROJECT BUTTONS */

        projectItems.forEach((item, i) => {

            item.classList.toggle(
                "active",
                i === currentSlide
            );

        });


        /* NUMBER */

        if (currentNumber) {

            currentNumber.textContent =
                String(currentSlide + 1).padStart(2, "0");

        }


        /* PROGRESS */

        if (progressBar) {

            const progress =
                ((currentSlide + 1) / slides.length) * 100;

            progressBar.style.width =
                progress + "%";

        }

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function nextSlide() {

        showSlide(currentSlide + 1);

        restartAutoSlide();

    }


    /* =====================================================
       PREVIOUS
    ===================================================== */

    function previousSlide() {

        showSlide(currentSlide - 1);

        restartAutoSlide();

    }


    /* =====================================================
       PROJECT BUTTONS
    ===================================================== */

    projectItems.forEach((item, index) => {

        item.addEventListener(
            "click",
            function () {

                showSlide(index);

                restartAutoSlide();

            }
        );

    });


    /* =====================================================
       ARROWS
    ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSlide
        );

    }


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            previousSlide
        );

    }


    /* =====================================================
       AUTO SLIDER
    ===================================================== */

    function startAutoSlide() {

        autoSlide =
            setInterval(() => {

                showSlide(currentSlide + 1);

            }, 6000);

    }


    /* =====================================================
       RESTART AUTO SLIDER
    ===================================================== */

    function restartAutoSlide() {

        clearInterval(autoSlide);

        startAutoSlide();

    }


    /* =====================================================
       INITIAL
    ===================================================== */

    showSlide(0);

    startAutoSlide();

});

document.addEventListener("DOMContentLoaded", function () {

    const menuButton =
        document.getElementById("mobile-menu-btn");

    const mobileMenu =
        document.getElementById("mobile-menu");


    if (!menuButton || !mobileMenu) {
        return;
    }


    menuButton.addEventListener("click", function () {

        mobileMenu.classList.toggle("show");

    });


    /* Close mobile menu after clicking a link */

    const links =
        mobileMenu.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener("click", function () {

            mobileMenu.classList.remove("show");

        });

    });

});

// Service view toggle

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-read-more]"
            );


        if (!button) {

            return;

        }


        const card =
            button.closest(
                ".service-card"
            );


        if (!card) {

            return;

        }


        const description =
            card.querySelector(
                "[data-service-description]"
            );


        const text =
            button.querySelector(
                ".read-more-text"
            );


        const arrow =
            button.querySelector(
                ".arrow"
            );


        if (
            !description ||
            !text
        ) {

            return;

        }


        const isExpanded =
            description.classList.contains(
                "expanded"
            );


        // ====================================================
        // CLOSE ALL OTHER CARDS
        // ====================================================

        document
            .querySelectorAll(
                ".service-description.expanded"
            )
            .forEach(
                otherDescription => {

                    if (
                        otherDescription ===
                        description
                    ) {

                        return;

                    }


                    otherDescription.classList.remove(
                        "expanded"
                    );


                    const otherCard =
                        otherDescription.closest(
                            ".service-card"
                        );


                    if (!otherCard) {

                        return;

                    }


                    const otherButton =
                        otherCard.querySelector(
                            "[data-read-more]"
                        );


                    if (!otherButton) {

                        return;

                    }


                    const otherText =
                        otherButton.querySelector(
                            ".read-more-text"
                        );


                    const otherArrow =
                        otherButton.querySelector(
                            ".arrow"
                        );


                    if (otherText) {

                        otherText.textContent =
                            "Read More";

                    }


                    if (otherArrow) {

                        otherArrow.textContent =
                            "↓";

                    }


                    otherButton
                        .classList
                        .remove(
                            "active"
                        );


                    otherButton
                        .setAttribute(
                            "aria-expanded",
                            "false"
                        );

                }
            );


        // ====================================================
        // OPEN
        // ====================================================

        if (!isExpanded) {

            description
                .classList
                .add(
                    "expanded"
                );


            text.textContent =
                "Read Less";


            if (arrow) {

                arrow.textContent =
                    "↑";

            }


            button
                .classList
                .add(
                    "active"
                );


            button
                .setAttribute(
                    "aria-expanded",
                    "true"
                );

        }


        // ====================================================
        // CLOSE
        // ====================================================

        else {

            description
                .classList
                .remove(
                    "expanded"
                );


            text.textContent =
                "Read More";


            if (arrow) {

                arrow.textContent =
                    "↓";

            }


            button
                .classList
                .remove(
                    "active"
                );


            button
                .setAttribute(
                    "aria-expanded",
                    "false"
                );

        }

    }
);