import { ExerciseDemo } from './ExerciseDemo';

export default function DemoPage() {
  // Demo vocabulary - Fruits theme
  const demoVocabulary = [
    { id: '1', word: 'Apple', meaning: 'Qua tao', order_index: 0 },
    { id: '2', word: 'Banana', meaning: 'Qua chuoi', order_index: 1 },
    { id: '3', word: 'Orange', meaning: 'Qua cam', order_index: 2 },
    { id: '4', word: 'Grape', meaning: 'Qua nho', order_index: 3 },
    { id: '5', word: 'Watermelon', meaning: 'Dua hau', order_index: 4 },
  ];

  return (
    <ExerciseDemo
      assignment={{
        id: 'demo',
        title: 'Fruits - Trai cay',
        description: 'Hoc tu vung ve cac loai trai cay',
      }}
      vocabulary={demoVocabulary}
      showMeaning={true}
    />
  );
}
