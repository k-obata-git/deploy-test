'use client';

import { BsCardList, BsCheckSquare, BsFileFont, BsQuestionCircle, BsUiRadios } from 'react-icons/bs';
import { QuestionType } from '../../../types/formType';

interface Props {
  type: QuestionType;
}

export default function QuestionTypeIcon({ type }: Props){
    switch (type) {
      case 'text':
        return <span><BsFileFont />テキスト</span>;
      case 'radio':
        return <span><BsUiRadios />ラジオ</span>;
      case 'checkbox':
        return <span><BsCheckSquare />チェックボックス</span>;
      case 'select':
        return <span><BsCardList />セレクトボックス</span>;
      default:
        return <BsQuestionCircle />;
    }
}
