<script>
import { reactive, toRaw } from 'vue';
import headerSection from '../components/header.vue';
import footerSection from '../components/footer.vue';
import { useLayoutStore } from "../stores/layout.js";
import { useWidgetStore } from "../stores/widget.js";
import { computed } from 'vue';
import { useHead } from '@vueuse/head';
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/vue-splide/css';
import moment from 'moment';
import ru from 'moment/locale/ru';
export default {
  name: "Object",
  setup() {
    const widgetStore = useWidgetStore();
    const layoutStore = useLayoutStore();
    const layout = computed(() => layoutStore.getLayout);
    // const open = (id) => widgetStore.open(id); // use action
    const background = computed(() => layoutStore.getBackground);
    const logo = computed(() => layoutStore.getLogo);
    const logo2 = computed(() => layoutStore.getLogo2);
    return {
      // open
      layout,
      background,
      logo,
      logo2,
      open: widgetStore.openAction,
    };
  },
  components: {
    headerSection,
    footerSection,
    Splide,
    SplideSlide,
  },
  props: ['layoutLoaded'],
  // computed: {
  //   format() {
  //     const day = this.date.getDate();
  //     const month = this.date.getMonth() + 1;
  //     const year = this.date.getFullYear();

  //     return `${day}.${month}.${year}`;
  //   },
  // },
  data() {
    return {
      object: {},
      schedule: {},
      loading: true,
      date: null,
    };
  },
  watch: {
    date() {
      this.getSchedule(this.date);
    },
  },
  methods: {
    async getObject() {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v3/pages/objects/${this.$route.params.id}`;
      const params = {
          lang: import.meta.env.VITE_API_LANG,
          jsonld: import.meta.env.VITE_API_JSONLD,
          cityId: import.meta.env.VITE_API_CITY_ID,

          onlyDomain: import.meta.env.VITE_API_ONLY_DOMAIN,
          domain: import.meta.env.VITE_API_DOMAIN,
          distributor_company_id: import.meta.env.VITE_API_DISTRIBUTOR_COMPANY_ID,

      };

      
      await axios.get(apiUrl, { params }).then(response => {

        if (!response.data) {
          return;
        }

        this.object = response.data;

        useHead({
          title: (this.object.object.seo && this.object.object.seo.seoTitle) ? this.object.object.seo.seoTitle : this.object.object.name,
          meta: [
            {
              name: 'description',
              content: (this.object.object.seo && this.object.object.seo.seoDescription ? this.object.object.seo.seoDescription.replace(/<[^>]+>/g, '') : this.object.object.description.replace(/<[^>]+>/g, ''))
            }
          ]
        });

        
        if (this.object.calendar && this.object.calendar.length) {
          this.date = this.object.calendar[0].date;
        }
        
      });

      

      var tabsClick = $('.tabs .tab-links a, .tab-links-2 a, .tab-links-3 a');

      tabsClick.on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');
        var tabsCurrent = $('.tabs ' + currentAttrValue);
        // Show/Hide Tabs
        tabsCurrent.show().siblings().hide();
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
        
      });

      let timer = setInterval(() => {
        if (!window.runFancyBoxMedia) {
          console.log('FancyBoxMedia is empty');
        } else {
          window.runFancyBoxMedia();
          clearInterval(timer);
          console.log('Timer is stopped, fancybox is started');
        }
      }, 500);

      // await this.getSchedule(null);

      setTimeout(() => {
            this.loading = false;
      }, 500);
    },

    getSchedule(date) {
      return new Promise((resolve, reject) => {
        const defaultDate = moment().startOf('day').unix();
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v2/schedule/objects/${this.$route.params.id}`;
        const params = {
            lang: import.meta.env.VITE_API_LANG,
            jsonld: import.meta.env.VITE_API_JSONLD,
            
            time: date ? moment(date).startOf('day').unix() : defaultDate,

            cityId: import.meta.env.VITE_API_CITY_ID,

        };
        
        axios.get(apiUrl, { params })
          .then(response => {
            if (!response.data) {
              return;
            }
            
            this.schedule = response.data;
            this.scheduleKey++;
            resolve(response.data);
          })
          .catch(e => {
            reject(e);
          });
      });
      
    },

    strTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('DD.MM.YYYY');
    },

    sessionTimestampToHumanTime(timestamp) {
      return moment(timestamp * 1000).format('HH:mm');
    },

    openWidget(session, type = 'session') {
      // let sessionId = this.checkSessionDisabled(session) == false ? session.id : 0
      // this.open2(sessionId);
      this.open(session.id, type);
    },
    checkSessionDisabled(session) {
      if (!session.isSaleOpen || (session.isSaleOpen && session.timeSpending < this.dateToTimestamp(new Date()))) {
        
        return true;
      }
      
      return false;
    },
    dateToTimestamp(date) {
      return moment(date).unix();
    },
    
  },
  beforeMount() {
    
    this.layoutLoaded
      .then(() => this.getObject())
      // .then(() => {
      //   requestAnimationFrame(() => {
      //     setTimeout(() => {
      //       this.loading = false;
      //     }, 700);
      //   });
      // })
      .catch(error => console.error("Ошибка выполнения getObject", error));
  },
};
</script>

<template>
  <main>
      <!--preloading-->
      <div id="preloader" v-if="loading">
          <img class="logo" :src="logo2" alt="" width="119" height="58">
          <div id="status">
              <span></span>
              <span></span>
          </div>
      </div>

      <headerSection :filteredCategoriesData="layoutStore.filteredCategoriesData" />

      <div class="hero mv-single-hero background-properties" v-if="object.object" :style="{ 'background': `url(${object.object.image['original']})` }">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              
            </div>
          </div>
        </div>
      </div>
      <div class="page-single movie-single movie_single" v-if="object.object">
        <div class="container">
          <div class="row ipad-width2">
            <div class="col-md-4 col-sm-12 col-xs-12">
              <div class="movie-img sticky-sb">
                <img :src="object.object.image['420x300']" alt="">
                <div class="movie-btn">	
                  
                  <div class="btn-transform transform-vertical">
                    <div @click.prevent="openWidget(object.object, 'object')"><a href="#" class="item item-1 yellowbtn"> <i class="ion-card"></i> Купить билет</a></div>
                    <div @click.prevent="openWidget(object.object, 'object')"><a href="#" class="item item-2 yellowbtn"><i class="ion-card"></i></a></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-8 col-sm-12 col-xs-12">
              <div class="movie-single-ct main-content">
                <h1 class="bd-hd">{{ object.object.name }}<span></span></h1>
                
                <div class="movie-tabs">
                  <div class="tabs" style="overflow: visible;">
                    <ul class="tab-links tabs-mv">
                      <li class="active"><a href="#cast">  Расписание </a></li>
                      <li><a href="#overview">Описание</a></li>
                      
                      <li><a href="#media">Галерея</a></li> 
                      
                    </ul>
                      <div class="tab-content">
                          <div id="overview" class="tab" style="margin-left: -15px;">
                              <div class="row">
                                <div class="col-md-8 col-sm-12 col-xs-12">
                                  <p v-html="object.object.description"></p>
                                  
                                  <div class="title-hd-sm">
                              
                                  </div>
                                  <div class="" v-if="layout && layout.socials && Object.keys(layout.socials).length">
                                    <div class="social-buttons socials-wrapper">
                                      <a :href="layout.socials[object.object.id].vkUrl" class="btn btn-social btn-vk" target="_blank" v-if="layout && layout.socials && layout.socials[object.object.id] && layout.socials[object.object.id].vkUrl">
                                          <i class="fa fa-vk"></i> ВКонтакте
                                      </a>
                                      <a :href="layout.socials[object.object.id].instagramUrl" class="btn btn-social btn-instagram" target="_blank" v-if="layout && layout.socials && layout.socials[object.object.id] && layout.socials[object.object.id].instagramUrl">
                                          <i class="fa fa-instagram"></i> Instagram
                                      </a>
                                      <a :href="layout.socials[object.object.id].facebookUrl" class="btn btn-social btn-telegram" target="_blank" v-if="layout && layout.socials && layout.socials[object.object.id] && layout.socials[object.object.id].facebookUrl">
                                          <i class="fa fa-facebook"></i> Facebook
                                      </a>
                                      
                                      
                                    </div>
                                    <!-- <div class="sidebar">
                                      <div class="sb-it">
                                        
                                        
                                      </div>
                                    </div> -->
                                  </div>
                                </div>
                                <div class="col-md-4 col-xs-12 col-sm-12" v-if="object.object.attributes && object.object.attributes.length">
                                  <div class="sb-it" v-for="attr in object.object.attributes" :key="attr">
                                    <h6>{{ attr.name }}</h6>
                                    <p><a href="#">{{ attr.value }}</a></p>
                                  </div>
                
                                  
                                </div>
                              </div>
                          </div>
                          <div id="reviews" class="tab review">
                            <div class="row">
                                <div class="rv-hd">
                                  <div class="div">
                                    <h3>Related Movies To</h3>
                                  <h2>Skyfall: Quantum of Spectre</h2>
                                  </div>
                                  <a href="#" class="redbtn">Write Review</a>
                                </div>
                                <div class="topbar-filter">
                            <p>Found <span>56 reviews</span> in total</p>
                            <label>Filter by:</label>
                            <select>
                              <option value="popularity">Popularity Descending</option>
                              <option value="popularity">Popularity Ascending</option>
                              <option value="rating">Rating Descending</option>
                              <option value="rating">Rating Ascending</option>
                              <option value="date">Release date Descending</option>
                              <option value="date">Release date Ascending</option>
                            </select>
                          </div>
                          <div class="mv-user-review-item">
                            <div class="user-infor">
                              <img src="../assets/images/uploads/userava1.jpg" alt="">
                              <div>
                                <h3>Best Marvel movie in my opinion</h3>
                                <div class="no-star">
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star last"></i>
                                </div>
                                <p class="time">
                                  17 December 2016 by <a href="#"> hawaiipierson</a>
                                </p>
                              </div>
                            </div>
                            <p>This is by far one of my favorite movies from the MCU. The introduction of new Characters both good and bad also makes the movie more exciting. giving the characters more of a back story can also help audiences relate more to different characters better, and it connects a bond between the audience and actors or characters. Having seen the movie three times does not bother me here as it is as thrilling and exciting every time I am watching it. In other words, the movie is by far better than previous movies (and I do love everything Marvel), the plotting is splendid (they really do out do themselves in each film, there are no problems watching it more than once.</p>
                          </div>
                          <div class="mv-user-review-item">
                            <div class="user-infor">
                              <img src="../assets/images/uploads/userava2.jpg" alt="">
                              <div>
                                <h3>Just about as good as the first one!</h3>
                                <div class="no-star">
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                </div>
                                <p class="time">
                                  17 December 2016 by <a href="#"> hawaiipierson</a>
                                </p>
                              </div>
                            </div>
                            <p>Avengers Age of Ultron is an excellent sequel and a worthy MCU title! There are a lot of good and one thing that feels off in my opinion. </p>

                            <p>THE GOOD:</p>

                            <p>First off the action in this movie is amazing, to buildings crumbling, to evil blue eyed robots tearing stuff up, this movie has the action perfectly handled. And with that action comes visuals. The visuals are really good, even though you can see clearly where they are through the movie, but that doesn't detract from the experience. While all the CGI glory is taking place, there are lovable characters that are in the mix. First off the original characters, Iron Man, Captain America, Thor, Hulk, Black Widow, and Hawkeye, are just as brilliant as they are always. And Joss Whedon fixed my main problem in the first Avengers by putting in more Hawkeye and him more fleshed out. Then there is the new Avengers, Quicksilver, Scarletwich, and Vision, they are pretty cool in my opinion. Vision in particular is pretty amazing in all his scenes.</p>

                            <p>THE BAD:</p>

                            <p>The beginning of the film it's fine until towards the second act and there is when it starts to feel a little rushed. Also I do feel like there are scenes missing but there was talk of an extended version on Blu-Ray so that's cool.</p>
                          </div>
                          <div class="mv-user-review-item">
                            <div class="user-infor">
                              <img src="../assets/images/uploads/userava3.jpg" alt="">
                              <div>
                                <h3>One of the most boring exepirences from watching a movie</h3>
                                <div class="no-star">
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                </div>
                                <p class="time">
                                  26 March 2017 by<a href="#"> christopherfreeman</a>
                                </p>
                              </div>
                            </div>
                            <p>I can't right much... it's just so forgettable...Okay, from what I remember, I remember just sitting down on my seat and waiting for the movie to begin. 5 minutes into the movie, boring scene of Tony Stark just talking to his "dead" friends saying it's his fault. 10 minutes in: Boring scene of Ultron and Jarvis having robot space battles(I dunno:/). 15 minutes in: I leave the theatre.2nd attempt at watching it: I fall asleep. What woke me up is the next movie on Netflix when the movie was over.</p>

                            <p>Bottemline: It's boring...</p>

                            <p>10/10 because I'm a Marvel Fanboy</p>
                          </div>
                          <div class="mv-user-review-item ">
                            <div class="user-infor">
                              <img src="../assets/images/uploads/userava4.jpg" alt="">
                              <div>
                                <h3>That spirit of fun</h3>
                                <div class="no-star">
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                </div>
                                <p class="time">
                                  26 March 2017 by <a href="#"> juliawest</a>
                                </p>
                              </div>
                            </div>
                            <p>If there were not an audience for Marvel comic heroes than clearly these films would not be made, to answer one other reviewer although I sympathize with him somewhat. The world is indeed an infinitely more complex place than the world of Marvel comics with clearly identifiable heroes and villains. But I get the feeling that from Robert Downey, Jr. on down the organizer and prime mover as Iron Man behind the Avengers these players do love doing these roles because it's a lot of fun. If they didn't show that spirit of fun to the audience than these films would never be made.</p>

                            <p>So in that spirit of fun Avengers: Age Of Ultron comes before us and everyone looks like they're having a good time saving the world. A computer program got loose and took form in this dimension named Ultron and James Spader who is completely unrecognizable is running amuck in the earth. No doubt Star Trek fans took notice that this guy's mission is to cleanse the earth much like that old earth probe NOMAD which got its programming mixed up in that classic Star Trek prime story. Wouldst Captain James T. Kirk of the Enterprise had a crew like Downey has at his command.</p>
                            <p>My favorite is always Chris Evans because of the whole cast he best gets into the spirit of being a superhero. Of all of them, he's already played two superheroes, Captain America and Johnny Storm the Human Torch. I'll be before he's done Evans will play a couple of more as long as the money's good and he enjoys it.</p>

                            <p>Pretend you're a kid again and enjoy, don't take it so seriously.</p>
                          </div>
                          <div class="mv-user-review-item last">
                            <div class="user-infor">
                              <img src="../assets/images/uploads/userava5.jpg" alt="">
                              <div>
                                <h3>Impressive Special Effects and Cast</h3>
                                <div class="no-star">
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star"></i>
                                  <i class="ion-android-star last"></i>
                                  <i class="ion-android-star last"></i>
                                </div>
                                <p class="time">
                                  26 March 2017 by <a href="#"> johnnylee</a>
                                </p>
                              </div>
                            </div>
                            <p>The Avengers raid a Hydra base in Sokovia commanded by Strucker and they retrieve Loki's scepter. They also discover that Strucker had been conducting experiments with the orphan twins Pietro Maximoff (Aaron Taylor-Johnson), who has super speed, and Wanda Maximoff (Elizabeth Olsen), who can control minds and project energy. Tony Stark (Robert Downey Jr.) discovers an Artificial Intelligence in the scepter and convinces Bruce Banner (Mark Ruffalo) to secretly help him to transfer the A.I. to his Ultron defense system. However, the Ultron understands that is necessary to annihilate mankind to save the planet, attacks the Avengers and flees to Sokovia with the scepter. He builds an armature for self-protection and robots for his army and teams up with the twins. The Avengers go to Clinton Barton's house to recover, but out of the blue, Nick Fury (Samuel L. Jackson) arrives and convinces them to fight against Ultron. Will they succeed? </p>

                            <p>"Avengers: Age of Ultron" is an entertaining adventure with impressive special effects and cast. The storyline might be better, since most of the characters do not show any chemistry. However, it is worthwhile watching this film since the amazing special effects are not possible to be described in words. Why Pietro has to die is also not possible to be explained. My vote is eight.</p>
                          </div>
                          <div class="topbar-filter">
                            <label>Reviews per page:</label>
                            <select>
                              <option value="range">5 Reviews</option>
                              <option value="saab">10 Reviews</option>
                            </select>
                            <div class="pagination2">
                              <span>Page 1 of 6:</span>
                              <a class="active" href="#">1</a>
                              <a href="#">2</a>
                              <a href="#">3</a>
                              <a href="#">4</a>
                              <a href="#">5</a>
                              <a href="#">6</a>
                              <a href="#"><i class="ion-arrow-right-b"></i></a>
                            </div>
                          </div>
                              </div>
                          </div>
                          <div id="cast" class="tab active">
                            
                            <div class="row">
                              <h3>Выберите дату</h3>
                                <VueDatePicker v-model="date" format="dd.MM.yyyy" id="datePicker" :enable-time-picker="false" hide-offset-dates :allowed-dates="object.calendar.map(item => item.date)" locale="ru" :space-confirm="false" auto-apply></VueDatePicker>
                                
                              
                          <div class="title-hd-sm">
                            <!-- <h4>Directors & Credit Writers</h4> -->
                          </div>

                          
                          <div class="mvcast-item" v-if="schedule.data">											
                            <div class="cast-it" v-for="event in schedule.data[0].events" :key="event">
                              <div class="cast-left cast-left-object">
                                
                                <img :src="event.image['170x240']" alt="" @click="$router.push(`/event/${event.id}`)" style="cursor:pointer;">

                                <div style="display: flex;flex-direction: column;margin-right: 15px;">
                                  <router-link :to="`/event/${event.id}`">{{ event.name }}</router-link>
                                  <div class="movie-rate" v-if="event.kinopoiskRank">
                                    <div class="rate">
                                      <i class="ion-android-star"></i>
                                      <p ><span>{{ event.kinopoiskRank }}</span> /10<br>                                      
                                      </p>
                                    </div>
                                  </div>
                                  <p class="event-shortDesription" style="margin-top: 10px;" v-html="event.shortDescription"></p>
                                </div>
                                
                              </div>
                              
                              <div class="cast-right">
                                <button class="widget-btn" v-for="session in event.sessions" :key="session" :disabled="checkSessionDisabled(session)" @click.prevent="openWidget(session, 'session')">
                                  <span>{{ sessionTimestampToHumanTime(session.timeSpending) }}</span>
                                </button>
                                
                                
                              </div>
                            </div>
                            
                          </div>
                          
                              </div>
                          </div>
                          <div id="media" class="tab">
                            <div class="row">

                              
                              
                              <div class="mvsingle-item">
                                <a class="img-lightbox"  data-fancybox-group="gallery" :href="image['1300x560']" v-for="image in object.object.images" :key="image"><img :src="image['1300x560']" alt="" width="300" height="200"></a>
                              </div>
                            </div>
                          </div>
                          <div id="moviesrelated" class="tab">
                            <div class="row">
                              <h3>Related Movies To</h3>
                              <h2>Skyfall: Quantum of Spectre</h2>
                              <div class="topbar-filter">
                            <p>Found <span>12 movies</span> in total</p>
                            <label>Sort by:</label>
                            <select>
                              <option value="popularity">Popularity Descending</option>
                              <option value="popularity">Popularity Ascending</option>
                              <option value="rating">Rating Descending</option>
                              <option value="rating">Rating Ascending</option>
                              <option value="date">Release date Descending</option>
                              <option value="date">Release date Ascending</option>
                            </select>
                          </div>
                          <div class="movie-item-style-2">
                            <img src="../assets/images/uploads/mv1.jpg" alt="">
                            <div class="mv-item-infor">
                              <h6><a href="#">oblivion <span>(2012)</span></a></h6>
                              <p class="rate"><i class="ion-android-star"></i><span>8.1</span> /10</p>
                              <p class="describe">Earth's mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity...</p>
                              <p class="run-time"> Run Time: 2h21’    .     <span>MMPA: PG-13 </span>    .     <span>Release: 1 May 2015</span></p>
                              <p>Director: <a href="#">Joss Whedon</a></p>
                              <p>Stars: <a href="#">Robert Downey Jr.,</a> <a href="#">Chris Evans,</a> <a href="#">  Chris Hemsworth</a></p>
                            </div>
                          </div>
                          <div class="movie-item-style-2">
                            <img src="../assets/images/uploads/mv2.jpg" alt="">
                            <div class="mv-item-infor">
                              <h6><a href="#">into the wild <span>(2014)</span></a></h6>
                              <p class="rate"><i class="ion-android-star"></i><span>7.8</span> /10</p>
                              <p class="describe">As Steve Rogers struggles to embrace his role in the modern world, he teams up with a fellow Avenger and S.H.I.E.L.D agent, Black Widow, to battle a new threat...</p>
                              <p class="run-time"> Run Time: 2h21’    .     <span>MMPA: PG-13 </span>    .     <span>Release: 1 May 2015</span></p>
                              <p>Director: <a href="#">Anthony Russo,</a><a href="#">Joe Russo</a></p>
                              <p>Stars: <a href="#">Chris Evans,</a> <a href="#">Samuel L. Jackson,</a> <a href="#">  Scarlett Johansson</a></p>
                            </div>
                          </div>
                          <div class="movie-item-style-2">
                            <img src="../assets/images/uploads/mv3.jpg" alt="">
                            <div class="mv-item-infor">
                              <h6><a href="#">blade runner  <span>(2015)</span></a></h6>
                              <p class="rate"><i class="ion-android-star"></i><span>7.3</span> /10</p>
                              <p class="describe">Armed with a super-suit with the astonishing ability to shrink in scale but increase in strength, cat burglar Scott Lang must embrace his inner hero and help...</p>
                              <p class="run-time"> Run Time: 2h21’    .     <span>MMPA: PG-13 </span>    .     <span>Release: 1 May 2015</span></p>
                              <p>Director: <a href="#">Peyton Reed</a></p>
                              <p>Stars: <a href="#">Paul Rudd,</a> <a href="#"> Michael Douglas</a></p>
                            </div>
                          </div>
                          <div class="movie-item-style-2">
                            <img src="../assets/images/uploads/mv4.jpg" alt="">
                            <div class="mv-item-infor">
                              <h6><a href="#">Mulholland pride<span> (2013)  </span></a></h6>
                              <p class="rate"><i class="ion-android-star"></i><span>7.2</span> /10</p>
                              <p class="describe">When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.</p>
                              <p class="run-time"> Run Time: 2h21’    .     <span>MMPA: PG-13 </span>    .     <span>Release: 1 May 2015</span></p>
                              <p>Director: <a href="#">Shane Black</a></p>
                              <p>Stars: <a href="#">Robert Downey Jr., </a> <a href="#">  Guy Pearce,</a><a href="#">Don Cheadle</a></p>
                            </div>
                          </div>
                          <div class="movie-item-style-2">
                            <img src="../assets/images/uploads/mv5.jpg" alt="">
                            <div class="mv-item-infor">
                              <h6><a href="#">skyfall: evil of boss<span> (2013)  </span></a></h6>
                              <p class="rate"><i class="ion-android-star"></i><span>7.0</span> /10</p>
                              <p class="describe">When Tony Stark's world is torn apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.</p>
                              <p class="run-time"> Run Time: 2h21’    .     <span>MMPA: PG-13 </span>    .     <span>Release: 1 May 2015</span></p>
                              <p>Director: <a href="#">Alan Taylor</a></p>
                              <p>Stars: <a href="#">Chris Hemsworth,  </a> <a href="#">  Natalie Portman,</a><a href="#">Tom Hiddleston</a></p>
                            </div>
                          </div>
                          <div class="topbar-filter">
                            <label>Movies per page:</label>
                            <select>
                              <option value="range">5 Movies</option>
                              <option value="saab">10 Movies</option>
                            </select>
                            <div class="pagination2">
                              <span>Page 1 of 2:</span>
                              <a class="active" href="#">1</a>
                              <a href="#">2</a>
                              <a href="#"><i class="ion-arrow-right-b"></i></a>
                            </div>
                          </div>
                            </div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footerSection />
      
    </main>
</template>
