import type { Propriete } from '@/types/content'

export const proprietes: Propriete[] = [
  {
    id: 'tenacite',
    label: 'Ténacité',
    question: 'Encaisse-t-il un choc sans casser ?',
    explication: 'La ténacité, c\'est l\'énergie qu\'un bois absorbe avant de rompre. Un manche d\'outil ou un arc en ont besoin : ils subissent des chocs répétés.',
  },
  {
    id: 'elasticite',
    label: 'Élasticité',
    question: 'Plie-t-il, puis revient-il ?',
    explication: 'Un bois élastique se déforme sous l\'effort puis reprend sa forme en rendant l\'énergie. C\'est le moteur d\'un arc.',
  },
  {
    id: 'durete',
    label: 'Dureté',
    question: 'Résiste-t-il à l\'enfoncement ?',
    explication: 'Un bois dur se marque peu et s\'use lentement, mais demande plus d\'effort à travailler.',
  },
  {
    id: 'fendabilite',
    label: 'Fendabilité',
    question: 'Se fend-il droit ?',
    explication: 'Un bois au fil droit se fend proprement en suivant ses fibres. On en tire des lattes longues et régulières sans scie.',
  },
  {
    id: 'allumage',
    label: 'Allumage',
    question: 'S\'enflamme-t-il vite ?',
    explication: 'Les bois riches en résine, ou très secs et fins, prennent feu rapidement. Ils lancent un feu, ils ne l\'entretiennent pas.',
  },
  {
    id: 'chauffage',
    label: 'Pouvoir de chauffe',
    question: 'Brûle-t-il longtemps en chauffant ?',
    explication: 'Un bois dense et sec brûle longtemps et donne des braises. Il entretient le feu une fois lancé.',
  },
  {
    id: 'durabilite',
    label: 'Durabilité',
    question: 'Résiste-t-il à la pourriture dehors ?',
    explication: 'Certains bois, surtout leur cœur coloré, résistent aux champignons et aux insectes. D\'autres pourrissent vite au contact du sol.',
  },
  {
    id: 'travail',
    label: 'Facilité de travail',
    question: 'Se taille-t-il facilement au couteau ?',
    explication: 'Un bois tendre et homogène se sculpte facilement. Un bois dur ou noueux résiste à la lame.',
  },
  {
    id: 'rectitude',
    label: 'Rectitude',
    question: 'Trouve-t-on des tiges ou des pièces bien droites ?',
    explication: 'Certaines plantes produisent des tiges très droites, prêtes à l\'emploi sans scier ni fendre.',
  },
  {
    id: 'creux',
    label: 'Facilité à évider',
    question: 'L\'intérieur se vide-t-il facilement ?',
    explication: 'Une moelle large et tendre se retire facilement : la tige devient un tube.',
  },
]
