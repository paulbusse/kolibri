import store from 'kolibri.coreVue.vuex.store';
import router from 'kolibri.coreVue.router';
import Lockr from 'lockr';
import { SIGNED_OUT_DUE_TO_INACTIVITY } from 'kolibri.coreVue.vuex.constants';
import { showSignInPage } from './modules/signIn/handlers';
import { showSignUpPage } from './modules/signUp/handlers';
import { showProfilePage } from './modules/profile/handlers';
import { ComponentMap, PageNames } from './constants';

import AuthSelect from './views/AuthSelect';
import FacilitySelect from './views/FacilitySelect';
import ProfilePage from './views/ProfilePage';
import SignInPage from './views/SignInPage';
import SignUpPage from './views/SignUpPage';

router.beforeEach((to, from, next) => {
  const profileRoutes = [ComponentMap.PROFILE, ComponentMap.PROFILE_EDIT];
  // If logged in and not already going to a Profile page, redirect
  if (store.getters.isUserLoggedIn && !profileRoutes.includes(to.name)) {
    next(router.getRoute(ComponentMap.PROFILE));
  } else {
    next();
  }
});

export default [
  {
    path: '/',
    name: 'root',
    beforeEnter(to, from, next) {
      // Always redirect to Profile if logged in.
      if (store.getters.isUserLoggedIn) {
        next(router.getRoute(ComponentMap.PROFILE));
      } else {
        // If Multiple Facilities but we've not stored a facilityId in localstorage
        // then we go to the AuthSelect route
        if (store.getters.facilities.length > 1 && !store.state.facilityId) {
          next(router.getRoute(ComponentMap.AUTH_SELECT));
        } else {
          next(router.getRoute(ComponentMap.SIGN_IN));
        }
      }
    },
  },
  {
    path: '/signin',
    component: SignInPage,
    beforeEnter(to, from, next) {
      if (store.getters.isUserLoggedIn) {
        next(router.getRoute(componentMap.PROFILE));
      } else {
        // If we're on multiple facility device, show auth_select when
        // there is no facilityId
        if (store.getters.facilities.length > 1 && !store.state.facilityId) {
          next(router.getRoute(ComponentMap.AUTH_SELECT));
        } else {
          showSignInPage(store).then(() => {
            store.commit('CORE_SET_PAGE_LOADING', false);
            next();
          });
        }
      }
    },
  },
  {
    path: '/create_account',
    component: SignUpPage,
    beforeEnter(to, from, next) {
      if (store.getters.isUserLoggedIn) {
        next(router.getRoute(ComponentMap.PROFILE));
        return Promise.resolve();
      } else {
        return showSignUpPage(store, fromRoute);
      }
    },
  },
  {
    path: '/signin-or-signup',
    component: AuthSelect,
    beforeEnter(to, from, next) {
      if (store.getters.isUserLoggedIn) {
        next(router.getRoute(ComponentMap.PROFILE));
      } else {
        next();
      }
    },
  },
  {
    path: '/facilities',
    component: FacilitySelect,
    props: true,
    beforeEnter(to, from, next) {
      if (store.getters.isUserLoggedIn) {
        router.replace({ name: PageNames.PROFILE });
      } else {
        next();
      }
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
    handler: () => {
      if (!store.getters.isUserLoggedIn) {
        router.replace({ name: PageNames.SIGN_IN });
      } else {
        showProfilePage(store);
      }
    },
  },
  {
    name: PageNames.PROFILE_EDIT,
    path: '/profile/edit',
    handler: () => {
      if (!store.getters.isUserLoggedIn) {
        router.replace({ name: PageNames.SIGN_IN });
      } else {
        store.dispatch('resetAndSetPageName', { pageName: PageNames.PROFILE_EDIT });
      }
    },
  },
  {
    path: '*',
    redirect: '/',
  },
];
