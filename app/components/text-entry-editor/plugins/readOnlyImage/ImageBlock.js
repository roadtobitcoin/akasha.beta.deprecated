import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import classNames from 'classnames';
import { findClosestMatch } from '../../../../utils/imageUtils';


/**
 * *****************************************************************
 *
 * data.media is the size the user wants to display an image
 *      - xs -> show the image on right size;
 *      - md -> show the image at the same width as the content;
 *      - xl -> show the image full window width;
 * Steps:
 *      - load the smallest image at the size the user wants (use imageObj.xs.src) and preset;
 *        the container for user selected size (data.media);
 *      - on image load calculate the size of the container and pick the matching resolution from imageObj;
 *      - (optional) on window resize recalculate the container size and rematch the res;
 *
 * ******************************************************************
 */


class ImageBlock extends Component {
    constructor (props) {
        super(props);
        this.state = {
            loading: true,
            isPlaying: false,
            imageLoaded: false,
            placeholderLoaded: false,
        };
    }

    onMouseEnter = () => {
        this.setState({
            isPlaying: true
        });
    };

    onMouseLeave = () => {
        this.setState({
            isPlaying: false
        });
    };

    _getImageSrc = () => {
        const { baseUrl, data } = this.props;
        const { files, media } = data;
        const gifPlaying = files.gif && this.state.isPlaying;
        const closestMatch = findClosestMatch(700, files, media);
        let fileKey = closestMatch;
        if ((media === 'xl' || media === 'xxl') && this.baseNodeRef) {
            fileKey = findClosestMatch(this.baseNodeRef.parentNode.clientWidth, files, media);
        }
        // @todo: get rid of this too;
        if (gifPlaying) {
            fileKey = 'gif';
        }
        return {
            width: gifPlaying ? files[closestMatch].width : files[fileKey].width,
            height: gifPlaying ? files[closestMatch].height : files[fileKey].height,
            src: `${baseUrl}/${files[fileKey].src}`
        };
    };

    _handleFullSizeSwitch = () => {
        const { data } = this.props;
        const { imgId } = data;
        this.props.onImageClick(imgId);
    }

    _handlePlaceholderLoad = (ev) => {
        const image = ev.target;
        this.setState((prevState) => {
            if (!prevState.placeholderLoaded) {
                return {
                    placeholderLoaded: true,
                    placeholderSize: {
                        width: image.getBoundingClientRect().width,
                        height: image.getBoundingClientRect().height,
                    }
                };
            }
            return prevState;
        });
    };

    _onLargeImageLoad = () => {
        this.setState({
            imageLoaded: true
        });
    };

    renderImage = () => {
        const { imageLoaded } = this.state;
        const image = this._getImageSrc();
        return (
          <img
            src={image.src}
            alt=""
            className="image-block__image"
            onLoad={this._onLargeImageLoad}
            style={{
                opacity: imageLoaded ? 1 : 0,
                display: imageLoaded ? 'block' : 'none',
                width: image.width,
                height: 'auto',
                maxWidth: '100%',
            }}
          />
        );
    };

    render () {
        const { data, baseUrl } = this.props;
        const { caption, files, media } = data;
        const { isPlaying, imageLoaded } = this.state;
        const gifClass = classNames('image-block__gif-play-icon', {
            'image-block__gif-play-icon_is-playing': isPlaying
        });
        return (
          <div
            className={`image-block image-block__readonly image-block__readonly_${media}`}
            ref={(baseNode) => { this.baseNodeRef = baseNode; }}
            onMouseEnter={files.gif && this.onMouseEnter}
            onMouseLeave={files.gif && this.onMouseLeave}
          >
            {files.gif &&
              <div className={gifClass}>
                <Icon type="play-circle-o" />
              </div>
            }
            <div
              className={
                `image-block__image-placeholder-wrapper
                image-block__image-placeholder-wrapper${imageLoaded ? '_loaded' : ''}`
              }
              ref={(node) => { this.placeholderNodeRef = node; }}
              onClick={this._handleFullSizeSwitch}
            >
              <div
                className={
                    `image-block__image-placeholder-wrapper_overlay
                    image-block__image-placeholder-wrapper_${media}`
                }
              >
                <img
                  src={`${baseUrl}/${files.xs.src}`}
                  onLoad={this._handlePlaceholderLoad}
                  className="image-block__image-placeholder"
                  alt=""
                />
              </div>
              {!isPlaying && this.renderImage()}
              {isPlaying && this.renderImage()}
            </div>
            <div className="image-block__image-caption" >
              <small>{caption}</small>
            </div>
          </div>
        );
    }
}

ImageBlock.propTypes = {
    baseUrl: PropTypes.string.isRequired,
    data: PropTypes.shape({
        files: PropTypes.shape(),
        caption: PropTypes.string,
        rightsHolder: PropTypes.string,
        media: PropTypes.string,
        licence: PropTypes.string,
        termsAccepted: PropTypes.bool
    }),
    onImageClick: PropTypes.func,
};

export default ImageBlock;
