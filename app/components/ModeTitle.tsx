import React from 'react';

import Settings from '../components/Settings';

function ModeTitle(props: any) {

  return (
    <>
      <div className="d-flex flex-row justify-content-center mb-3">
        <div className="p-2">
          <h1 className="mb-0 display-4 font-weight-bold">
            {
              (props.img)
                ? <img src={props.img} width="228" height="30" />
                : <>{props.title}</>
            }
          </h1>
        </div>
        <div className="p-2 ">
          <Settings />
        </div>
      </div>
    </>
  );
}

export default ModeTitle;
