import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren, Renderer2 } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { FeatureCarsoul, INFO_CARDS } from '../model/landing-model';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { OperatorapisService } from 'src/app/custom-services/operator/operatorapis.service';
import { Router } from '@angular/router';

gsap.registerPlugin(ScrollTrigger);
@Component({
  selector: 'app-operator-new-landing-page',
  templateUrl: './operator-new-landing-page.component.html',
  styleUrls: ['./operator-new-landing-page.component.scss']
})
export class OperatorNewLandingPageComponent implements AfterViewInit {
  @ViewChildren('cardEl') cardElements!: QueryList<ElementRef>;
  @ViewChildren('slideRef') slideElements!: QueryList<ElementRef>;
  featureDetailData: any = [];
  features: any = []
  isUnlocked = false;
  currentIndex = 0;
  isScrolling = false;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    autoplay: true,
    autoplayTimeout: 2500,
    autoplaySpeed: 600,
    smartSpeed: 600,
    touchDrag: false,
    pullDrag: false,
    autoplayHoverPause: true,
    dots: true,
    navSpeed: 700,
    dotsData: true,
    nav: true,
    navText: ['<i class="fa fa-angle-left" aria-hidden="true"></i>', '<i class="fa fa-angle-right" aria-hidden="true"></i>'],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
  }
  items = ['What is Skye Air and how does drone delivery work?', 'What is Skye Air and how does drone delivery work?', 'What is Skye Air and how does drone delivery work?',
    'What is Skye Air and how does drone delivery work?', 'What is Skye Air and how does drone delivery work?'];
  expandedIndex = 0;

  logo: string = 'assets/landing-img/skyeair_logo_white.png'; 
  location: string = '../../../assets/icons/location-1.svg'; 
  email: string = '../../../assets/icons/message.svg'; 
  phone: string = '../../../assets/icons/call.svg'; 
  logo1: string = 'assets/landing-img/Facebook.svg';
  logo2: string = 'assets/landing-img/Instagram.svg'; 
  logo3: string = 'assets/landing-img/Twitter.svg'; 
  logo4: string = 'assets/landing-img/LinkedIn.svg'; 
  features1 = ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'];
  data = {
    Content: {
      OfficeAddress: '123 Skye Air Lane, Sector 5, Gurgaon, Haryana, India',
      OfficeEmail: 'contact@skyeair.com',
      OfficeContact: '+91 123 456 7890',
      Contacts: [
        {
          Department: 'Sales',
          Name: 'John Doe',
          Email: 'john.doe@skyeair.com',
          Number: '+91 987 654 3210'
        },
        {
          Department: 'Support',
          Name: 'Jane Doe',
          Email: 'jane.doe@skyeair.com',
          Number: '+91 876 543 2109'
        },
        {
          Department: 'Sales',
          Name: 'John Doe',
          Email: 'john.doe@skyeair.com',
          Number: '+91 987 654 3210'
        },
        {
          Department: 'Support',
          Name: 'Jane Doe',
          Email: 'jane.doe@skyeair.com',
          Number: '+91 876 543 2109'
        }
      ]
    }
  };
  faqData: any;
  footerData: any;
  headingData: any;

  currentSlide = 1;
  totalSlides = 0;

  constructor(
    private operatorApi: OperatorapisService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.totalSlides = this.features.length;
    this.getData();
  }

  ngAfterViewInit(): void {
    const sections = gsap.utils.toArray<HTMLElement>(".stack-section");

    if(window.innerWidth <= 768) {
      return
    }

    sections.forEach((section, i) => {
      gsap.fromTo(section,
        { opacity: 1, y: 0 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          }
        }
      );
    });
    setTimeout(() => {
      const slides = this.el.nativeElement.querySelectorAll('.feature-slide');
      // const slides = this.slideElements.toArray().map(ref => ref.nativeElement);
      console.log('Slides found:', slides.length);
      // gsap.to('.feature-slide', {
      //   x: 100,
      //   duration: 1
      // });
      slides.forEach((slide: HTMLElement, index: number) => {
        ScrollTrigger.create({
          trigger: slide,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => this.setActive(slide, slides),
          onEnterBack: () => this.setActive(slide, slides),
          scrub: true
        });

        gsap.fromTo(
          slide,
          { y: 100 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              start: 'top bottom',
              end: 'top center',
              scrub: true
            }
          }
        );

        // gsap.fromTo(
        //   slide,
        //   { filter: 'blur(6px)' },
        //   {
        //     filter: 'blur(0px)',
        //     ease: 'none',
        //     scrollTrigger: {
        //       trigger: slide,
        //       start: 'top center',
        //       end: 'bottom center',
        //       scrub: true,
        //       onUpdate: self => {
        //         console.log(`Slide ${index}: progress = ${self.progress}`);
        //       }
        //     }
        //   }
        // );

        // gsap.fromTo(
        //   slide,
        //   { filter: 'blur(6px)' },
        //   {
        //     filter: 'blur(0px)',
        //     scrollTrigger: {
        //       trigger: slide,
        //       start: 'top center',
        //       end: 'bottom center',
        //       scrub: true,
        //       onUpdate: self => {
        //         console.log(`Slide ${index}: progress = ${self.progress}`);
        //       }
        //     }
        //   }
        // );

        // Slide up
        // gsap.fromTo(
        //   slide,
        //   { y: 100 },
        //   {
        //     y: 0,
        //     ease: 'none',
        //     scrollTrigger: {
        //       trigger: slide,
        //       start: 'top bottom',
        //       end: 'top center',
        //       scrub: true
        //     }
        //   }
        // );

      });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 800);
      // ScrollTrigger.config({
      //   autoRefreshEvents: 'DOMContentLoaded,load,resize'
      // });
      ScrollTrigger.refresh(true);


    }, 1000); 

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.10) {
            el.classList.remove('blurred');
          } else {
            el.classList.add('blurred');
          }

          // Check if last card is visible
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.9 &&
            el === this.cardElements.last.nativeElement
          ) {
            this.isUnlocked = true; // allow bottom scroll
          }
        });
      },
      { threshold: [0.9] }
    );

    this.cardElements.forEach((el) => observer.observe(el.nativeElement));
  }

  getData() {
    this.operatorApi.getLandingPageDetails().then((res) => {
      const landingPageData = {};

      if (res?.items?.length) {
        res.items.forEach((item) => {
          if (item.Section) {
            landingPageData[item.Section] = item.Content;
          }
        });

        this.faqData = landingPageData['FAQ'] || [];
        this.featureDetailData = landingPageData['FeatureDetailSection'];
        this.features = landingPageData['Features'].Features || [];
        this.footerData = landingPageData['Footer'];
        this.headingData = landingPageData['Heading'];

        // res.items.forEach((item) => {
        //   if (item.Section === 'Features' && item.Content?.Features) {
        //     landingPageData[item.Section] = item.Content.Features;
        //   } else {
        //     landingPageData[item.Section] = item.Content || null;
        //   }
        // });
      }

      // this.faqData = landingPageData['FAQ'];
      // this.featureDetailData = landingPageData['FeatureDetailSection'];
      // this.features = landingPageData['Features'];
      // this.footerData = landingPageData['Footer'];
      // this.headingData = landingPageData['Heading'];

    }).catch((err) => {
      console.log(err);
    })
  }

  setActive(activeSlide: HTMLElement, allSlides: NodeListOf<HTMLElement>) {
    console.log('working')
    allSlides.forEach(slide => slide.classList.remove('active'));
    this.renderer.addClass(activeSlide, 'active');
  }

  onTranslated(event: any) {
    const activeSlide = event.slides.find((slide: any) => {
      return slide.id && slide.id.includes('owl-slide');
    });

    if (activeSlide && activeSlide.id) {
      const slideIdParts = activeSlide.id.split('-'); 
      const slideNumber = parseInt(slideIdParts[2], 10); 

      this.currentSlide = slideNumber;
    }
  }

  onGeoZone() {
    this.router.navigateByUrl('operator/operator-app/dashboard');
  }

  navigate(value: String) {
    switch (value) {
      case 'GEOZONE':
        this.router.navigateByUrl('operator/operator-app/dashboard');
        break;
      case 'CONTACT':
        this.router.navigateByUrl('operator/contact');
        break;
      case 'LOGIN':
        this.router.navigateByUrl('operator/operator-login');
        break;
    }
  }

  scroll(){
    window.scrollTo(0, 0);
  }

}