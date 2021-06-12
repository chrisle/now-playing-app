import React from 'react';

type Props = {
  name: string;
  iconBaseFilename: string;
  ext: string;
  onlineStatus: string;
  offlineStatus: string;
  status: boolean;
}

class Connection extends React.Component<Props, {}> {

  render() {
    const { name, iconBaseFilename, ext, onlineStatus, offlineStatus, status } = this.props;
    const iconFilename = `images/${iconBaseFilename}${ (status) ? '' : '-disconnected' }.${ext}`;
    const statusMsg = (status) ? onlineStatus : offlineStatus;
    const baseClass = 'box small-box h-100 text-center text-capitalize d-flex flex-column text-decoration-none position-relative' + ((status) ? '' : ' disconnected');

    return (
      <div className="js-anim02 col d-flex flex-column mb-15 pt-md-4">
        <div className={baseClass}>
          <div className="icon-hold d-flex align-items-center w-100 justify-content-center pt-3 px-3 px-md-10 pt-md-10">
            <img src={iconFilename} alt="obs" width="48" height="48" />
          </div>
          <div className="d-block px-3 py-2 pt-md-10 pb-md-20 d-flex">
            <div className="mnh-36 d-flex flex-column justify-content-center align-items-center w-100">
              <div className="title">{ name }</div>
              <span className="link">
                <span className="icon position-relative d-inline-block align-middle">
                  <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(0.5 0.5)">
                      <path d="M0 2.11195L1.3596 0.752347C2.38741 -0.250782 4.02779 -0.250782 5.0556 0.752347L5.0556 0.752347C6.05873 1.78015 6.05873 3.42054 5.0556 4.44835L3.696 5.80795" transform="translate(4.7520003 5.3373482E-05)" className="path" fill="none" fillRule="evenodd" stroke="#1FCE9E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5.80795 3.696L4.44835 5.0556C3.42054 6.05873 1.78015 6.05873 0.752347 5.0556L0.752347 5.0556C-0.250782 4.02779 -0.250782 2.38741 0.752347 1.3596L2.11195 0" transform="translate(5.3373482E-05 4.7520003)" className="path" fill="none" fillRule="evenodd" stroke="#1FCE9E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M0 4.224L4.224 0" transform="translate(3.1680002 3.1680002)" className="path" fill="none" fillRule="evenodd" stroke="#1FCE9E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </span>
                { statusMsg }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default Connection;