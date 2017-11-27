import React from 'react';

const QuestionCircle = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" {...props}>
    <g fill="none" fillRule="evenodd">
      <circle cx="5" cy="5" r="5" fill="#D8DCDF" />
      <path fill="#FFFFFF" d="M3.5 3.97513661L3.35019413 3.81750761C3.39481381 2.94133935 4.00727242 2.35 4.98907104 2.35 5.91546696 2.35 6.58715847 2.93378557 6.58715847 3.7363388 6.58715847 4.30042786 6.30945321 4.73709544 5.79963579 5.04377671 5.41449901 5.27121969 5.31666667 5.41477267 5.31666667 5.72062842L5.31666667 5.94262295 5.16666667 6.09262295 4.56898907 6.09262295 4.41898907 5.94262295 4.41899338 5.62955163C4.41520784 5.12986096 4.65419842 4.77318562 5.17374247 4.46222622 5.53548969 4.24081197 5.65191257 4.06900345 5.65191257 3.7670765 5.65191257 3.4219729 5.38536868 3.18278689 4.96516393 3.18278689 4.53082919 3.18278689 4.26535351 3.42351483 4.23357457 3.83664109L4.08401639 3.97513661 3.5 3.97513661zM4.86953552 7.65C4.56811357 7.65 4.33019126 7.41207769 4.33019126 7.11065574 4.33019126 6.80679945 4.56712394 6.57131148 4.86953552 6.57131148 5.17437277 6.57131148 5.40887978 6.80581849 5.40887978 7.11065574 5.40887978 7.41306732 5.17339181 7.65 4.86953552 7.65z" />
    </g>
  </svg>
);

export default QuestionCircle;
