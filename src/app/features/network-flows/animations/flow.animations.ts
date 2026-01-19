import {
  trigger, transition, style, animate, keyframes, query, stagger
} from '@angular/animations';

export const flowAnimations = [
  trigger('flowAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
    ])
  ]),

  trigger('pulseAnimation', [
    transition(':enter', [
      animate('1s ease-in-out', keyframes([
        style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
        style({ transform: 'scale(1.1)', opacity: 0.8, offset: 0.5 }),
        style({ transform: 'scale(1)', opacity: 1, offset: 1 })
      ]))
    ])
  ]),

  trigger('nodeAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0)' }),
      animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ]),

  trigger('staggerList', [
    transition(':enter', [
      query('.flow-row', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        stagger(50, [
          animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),

  trigger('alertPulse', [
    transition(':enter', [
      animate('500ms ease-out', keyframes([
        style({ backgroundColor: 'rgba(255, 51, 102, 0.3)', offset: 0 }),
        style({ backgroundColor: 'rgba(255, 51, 102, 0.1)', offset: 0.5 }),
        style({ backgroundColor: 'transparent', offset: 1 })
      ]))
    ])
  ])
];
