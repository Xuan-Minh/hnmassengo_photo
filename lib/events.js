// lib/events.js

// =================================
// SYSTÈME D'ÉVÉNEMENTS PERSONNALISÉ
// =================================

/**
 * Noms d'événements centralisés pour la communication dans toute l'application
 */
export const EVENTS = {
  // Événements de l'overlay de contact
  CONTACT_SHOW: 'contact:show',
  CONTACT_HIDE: 'contact:hide',

  // Événements de l'overlay d'intro
  INTRO_SHOW: 'intro:show',
  INTRO_DISMISSED: 'intro:dismissed',
};

// NOUVEAU : Variable mémoire pour retenir l'état de l'intro pendant la navigation
export let isIntroDismissedState = false;

/**
 * Emit a custom event on the window object
 * @param {string} eventName - Name of the event from EVENTS constant
 * @param {*} detail - Optional data to pass with the event
 */
export const emitEvent = (eventName, detail = null) => {
  if (typeof window === 'undefined') return;

  // NOUVEAU : Mise à jour de l'état en mémoire
  if (eventName === EVENTS.INTRO_DISMISSED) {
    isIntroDismissedState = true;
  } else if (eventName === EVENTS.INTRO_SHOW) {
    isIntroDismissedState = false;
  }

  const event =
    detail !== null
      ? new CustomEvent(eventName, { detail })
      : new Event(eventName);

  window.dispatchEvent(event);
};

/**
 * Listen to a custom event on the window object
 * @param {string} eventName - Name of the event from EVENTS constant
 * @param {Function} handler - Callback function to execute when event fires
 * @returns {Function} Cleanup function to remove the event listener
 */
export const addEventHandler = (eventName, handler) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
};
