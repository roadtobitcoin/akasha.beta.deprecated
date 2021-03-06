export const licences = [
  {
    id: '1',
    parent: null,
    label: 'All rights reserved',
    description: [
      {
        icon: 'copyright-1', text: 'Others cannot copy, distribute, or perform your work without your' +
          ' permission (or as permitted by fair use).',
      },
    ],
  }, {
    id: '2',
    parent: null,
    label: 'Some rights reserved',
    description: [
      { icon: 'copyright-2', text: 'There are some rights reserved with this licence.' },
    ],
  }, {
    id: '3',
    parent: null,
    label: 'No rights reserved',
    description: [
      { icon: 'CCZERO', text: 'You will not have any rights.' },
    ],
  }, {
    id: '4',
    parent: '2',
    label: 'Attribution',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your
                        work as long as they credit you.`,
      },
    ],
  }, {
    id: '5',
    parent: '2',
    label: 'Attribution, no derivatives',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your work
                        as long as they credit you.`,
      },
      {
        icon: 'CCND',
        text: 'Others can only distribute non-derivative copies of your work.',
      },
    ],
  }, {
    id: '6',
    parent: '2',
    label: 'Attribution, share-alike',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your work as
                         long as they credit you.`,
      },
      {
        icon: 'CCSA',
        text: 'Others must distribute derivatives of your work under the same license.',
      },
    ],
  }, {
    id: '7',
    parent: '2',
    label: 'Attribution, non-commercial',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your work as
                         long as they credit you.`,
      },
      {
        icon: 'CCNC',
        text: 'Others can use your work for non-commercial purposes only. ',
      },
    ],
  }, {
    id: '8',
    parent: '2',
    label: 'Attribution, non-commercial, no-derivatives',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your work as
                         long as they credit you.`,
      },
      {
        icon: 'CCNC',
        text: 'Others can use your work for non-commercial purposes only. ',
      },
      {
        icon: 'CCND',
        text: 'Others can only distribute non-derivative copies of your work.',
      },
    ],
  }, {
    id: '9',
    parent: '2',
    label: 'Attribution, non-commercial, share-alike',
    description: [
      {
        icon: 'CCBY',
        text: `Others can distribute, remix, and build upon your work as
                         long as they credit you.`,
      },
      {
        icon: 'CCNC',
        text: 'Others can use your work for non-commercial purposes only. ',
      },
      {
        icon: 'CCSA',
        text: 'Others must distribute derivatives of your work under the same license.',
      },
    ],
  }, {
    id: '10',
    parent: '3',
    label: 'Creative Commons copyright waiver',
    description: [
      {
        icon: 'CCZERO',
        text: 'You waive all your copyright and related rights in this work, worldwide.',
      },
    ],
  }, {
    id: '11',
    parent: '3',
    label: 'Public Domain',
    description: [
      { icon: 'CCPD', text: 'This work is already in the public domain and free of copyright restrictions.' },
    ],
  },
];

export function getLicence(id) {
  return licences.find((element) => {
    return element.id === id + '';
  });
}
