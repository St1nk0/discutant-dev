import React, { PropTypes } from 'react';
import styles from './styles.scss';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

export default class WhiteboardOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      //initial coordinates for "DRAW_START" message
      initialCoordinates: {
        x: undefined,
        y: undefined,
      },

      pencilCoordinates: [],

      currentShapeId: undefined,
      count: 0,
    };

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  //main mouse down handler
  //calls a mouseDown<AnnotationName> handler based on the tool selected
  mouseDownHandler(event) {
    if(this.props.drawSettings.tool) {
      window.addEventListener('mouseup', this.mouseUpHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler, true);
      this["mouseDown" + this.props.drawSettings.tool](event);
    }
  }

  //main mouse up handler
  //calls a mouseUp<AnnotationName> handler based on the tool selected
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this["mouseUp" + this.props.drawSettings.tool](event);
  }

  //main mouse move handler
  //calls a mouseMove<AnnotationName> handler based on the tool selected
  mouseMoveHandler(event) {
    this["mouseMove" + this.props.drawSettings.tool](event);
  }

  mouseDownHand(event) {

  }

  mouseDownLine(event) {
    this.commonMouseDown(event);
  }

  mouseDownEllipse(event) {
    this.commonMouseDown(event);
  }

  mouseDownTriangle(event) {
    this.commonMouseDown(event);
  }

  mouseDownRectangle(event) {
    this.commonMouseDown(event);
  }

  mouseDownPencil(event) {
    let x = (event.nativeEvent.offsetX + this.props.viewBoxX) / this.props.slideWidth * 100;
    let y = (event.nativeEvent.offsetY + this.props.viewBoxY) / this.props.slideHeight * 100;
    let id = (this.state.count + 1) + "-" + new Date().getTime();

    let points = [];
    points.push(x);
    points.push(y);
    this.setState({
      pencilCoordinates: points,
      count: this.state.count + 1,
      currentShapeId: id,
    });
  }

  mouseDownText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseDown
  //so we just redirect their mouseDowns here
  commonMouseDown(event) {
    let x = (event.nativeEvent.offsetX + this.props.viewBoxX) / this.props.slideWidth * 100;
    let y = (event.nativeEvent.offsetY + this.props.viewBoxY) / this.props.slideHeight * 100;
    let id = (this.state.count + 1) + "-" + new Date().getTime();
    this["handleDraw" + this.props.drawSettings.tool]({x: x, y: y}, {x: x, y: y}, "DRAW_START", id);
    this.setState({
      initialCoordinates: {
        x: x,
        y: y,
      },
      count: this.state.count + 1,
      currentShapeId: id,
    });
  }

  mouseMoveHand(event){

  }

  mouseMoveLine(event) {
    this.commonMouseMove(event);
  }

  mouseMoveEllipse(event) {
    this.commonMouseMove(event);
  }

  mouseMoveTriangle(event) {
    this.commonMouseMove(event);
  }

  mouseMoveRectangle(event) {
    this.commonMouseMove(event);
  }

  mouseMovePencil(event) {
    //retrieving the svg object and calculating x and y coordinates
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;

    //adding new coordinates to the saved coordinates in the state
    let points = this.state.pencilCoordinates;
    points.push(transformedSvgPoint.x);
    points.push(transformedSvgPoint.y);

    //if we have 16 pairs - send a message (number 16 - to match Flash)
    if(points.length > 30) {
      //calling handleDrawPencil to send a message
      this.handleDrawPencil(points, "DRAW_START", this.state.currentShapeId);

      //generating a new shape Id
      let newId = (this.state.count + 1) + "-" + new Date().getTime();

      this.setState({
        //always save the last pair of coorindtates, since this is the start of the next chunk
        pencilCoordinates: [points[points.length - 2], points[points.length-1]],
        //updating count for the next shape id
        count: this.state.count + 1,
        currentShapeId: newId,
      });

    //if we don't have 16 pairs yet - just save an updated array in the state
    } else {
      this.setState({
        pencilCoordinates: points,
      });
    }
  }

  mouseMoveText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseMove
  //so we just redirect their mouseMoves here
  commonMouseMove(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;

    this["handleDraw" + this.props.drawSettings.tool](this.state.initialCoordinates, transformedSvgPoint, "DRAW_UPDATE", this.state.currentShapeId);
  }

  mouseUpHand(event) {

  }

  mouseUpLine(event) {
    this.commonMouseUp(event);
  }

  mouseUpEllipse(event) {
    this.commonMouseUp(event);
  }

  mouseUpTriangle(event) {
    this.commonMouseUp(event);
  }

  mouseUpRectangle(event) {
    this.commonMouseUp(event);
  }

  mouseUpPencil(event) {
    //drawing a pencil
    this.handleDrawPencil(this.state.pencilCoordinates, "DRAW_START", this.state.currentShapeId);

    this.setState({
      pencilCoordinates: [],
      currentShapeId: undefined,
    });
  }

  mouseUpText(event) {

  }

  //Line / Ellipse / Rectangle / Triangle have the same actions on mouseUp
  //so we just redirect their mouseUps here
  commonMouseUp(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;

    this["handleDraw" + this.props.drawSettings.tool](this.state.initialCoordinates, transformedSvgPoint, "DRAW_END", this.state.currentShapeId);
    this.setState({
      initialCoordinates: {
        x: undefined,
        y: undefined,
      },
      currentShapeId: undefined,
    });
  }

  handleDrawRectangle(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "rectangle");
  }

  handleDrawEllipse(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "ellipse");
  }

  handleDrawTriangle(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "triangle");
  }

  handleDrawLine(startPoint, endPoint, status, id) {
    this.handleDrawCommonAnnotation(startPoint, endPoint, status, id, "line");
  }

  handleDrawText() {

  }

  handleDrawPencil(points, status, id) {
    let shape = {
      annotation: {
        type: "pencil",
        points: points,
        color: this.props.drawSettings.color,
        transparency: false,
        status: status,
        thickness: this.props.drawSettings.thickness,
        id: id,
        whiteboardId: this.props.whiteboardId,
      },
      whiteboard_id: this.props.whiteboardId,
    };

    this.props.sendAnnotation(shape);
  }

  //since Rectangle / Triangle / Ellipse / Line have the same coordinate structure
  //we use the same function for all of them
  handleDrawCommonAnnotation(startPoint, endPoint, status, id, shapeType) {
    let shape = {
      annotation: {
        type: shapeType,
        points: [
          startPoint.x,
          startPoint.y,
          endPoint.x,
          endPoint.y,
        ],
        color: this.props.drawSettings.color,
        transparency: false,
        status: status,
        thickness: this.props.drawSettings.thickness,
        id: id,
        whiteboardId: this.props.whiteboardId,
      },
      whiteboard_id: this.props.whiteboardId,
    };

    this.props.sendAnnotation(shape);
  }

  //a function to transform a screen point to svg point
  //accepts and returns a point of type SvgPoint and an svg object
  coordinateTransform(screenPoint, someSvgObject) {
    var CTM = someSvgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
  }

  render() {
    let tool = this.props.drawSettings.tool;
    return (
      <div
        className={
          cx(
            tool == "Pencil" ? styles.pencil : '',
            tool == "Triangle" ? styles.triangle : '',
            tool == "Rectangle" ? styles.rectangle : '',
            tool == "Ellipse" ? styles.ellipse : '',
            tool == "Line" ? styles.line : '',
            tool ==  "Text" ? styles.text : ''
          )
        }
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      />
    );
  }
}
