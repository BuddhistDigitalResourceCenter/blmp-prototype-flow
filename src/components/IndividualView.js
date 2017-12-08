// @flow
import * as React from 'react';
import './IndividualView.css';
import Literal, { STRING_TYPE } from '../lib/Literal';
import Individual from '../lib/Individual';
import LiteralView from './LiteralView';
import Ontology from 'lib/Ontology';
import formatIRI from '../lib/formatIRI';
import classnames from 'classnames';
import { DATATYPE_PROPERTY, OBJECT_PROPERTY, ANNOTATION_PROPERTY } from '../lib/Ontology';
import RDFProperty from '../lib/RDFProperty';
import type { RDFComment } from '../lib/RDFProperty';
import capitalize from '../lib/capitalize';
import { REMOTE_ENTITIES } from '../api/api';
import store from "../index.js";
import * as ui from 'state/ui/actions';

// redux
import * as uiActions from 'state/ui/actions';

// rdf components
import RDFComponents from './RDF/rdf_components';

// Material-UI
import List, {ListItem, ListItemText, ListSubheader, ListItemSecondaryAction, ListItemIcon} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import IconButton from 'material-ui/IconButton';
import AddCircleIcon from 'material-ui-icons/AddCircle';
import RemoveCircleIcon from 'material-ui-icons/RemoveCircle';
import {red, green} from 'material-ui/colors';
import AddBoxIcon from 'material-ui-icons/AddBox';

const iconSizes = {
    small: {
        width: 20,
        height: 20
    }
};

const listHeaderStyle = {
    fontSize: '14px',
    paddingLeft: '0px',
    marginLeft: 0,
    color: '#444',
    fontWeight: 'bold'
};

const getListItemStyle = (level) => {
    return {
        border: 0,
        padding: "0 0 5px 0px",
        display: 'flex',
        alignItems: 'flex-end',
        marginLeft: 30 + 'px',
//              paddingRight:"50px"
    };
};

type IndividualPropertyProps = {
    isEditable: (propertyValue: ?any) => boolean,
    onIndividualUpdated?: () => void,
    onLiteralChanged: (value: string, language: string) => void,
    onSelectedResource: (IRI: string) => void,
    onTapAdd?: (individual: Individual, property: RDFProperty) => void,
    individual: Individual,
    level: number,
    ontology: Ontology,
    property: RDFProperty,
    propertyValues: any[],
    title: string,
    tooltip: string,
    showLabel: boolean,
    nested: boolean,
}

class IndividualProperty extends React.Component<IndividualPropertyProps> {
  
   /*
   componentWillMount()
   {
        console.log("will mount indiProp",this.props.individual.id) 
    }
   componentDidMount()
   {
        console.log("did mount indiProp",this.props.individual.id) 
    }
    
   componentWillUpdate()
   {
        console.log("will update indiProp",this.props.individual.id) 
    }
   componentDidUpdate()
   {
        console.log("did update indiProp",this.props.individual.id) 
    }
   */
   
    render() {
       
        console.groupCollapsed("indiProp.render",this.props.title)
  
        console.log(this.props.individual.id)
       
        const greenColor = {
            fill: green[800]
        };
        const redColor = {
            fill: red[800]
        };

        let listItemStyle = getListItemStyle(this.props.level);

        let onTapAdd = null;
        if (this.props.onTapAdd) {
            const propsOnTapAdd = this.props.onTapAdd;
            onTapAdd = () => {
                propsOnTapAdd(this.props.individual, this.props.property);
            }
        }

        // Header
        const propertySubheader = <ListItem>
                {this.props.isEditable() &&  //!this.props.nested && this.props.level < 1 &&
                    <ListItemIcon>
                        <IconButton
                            onClick={onTapAdd}
                            style={{marginRight: 0}}
                        >
                            <AddCircleIcon style={{...greenColor, ...iconSizes.small}}/>
                        </IconButton>
                    </ListItemIcon>
                }
                <ListItemText title={this.props.tooltip} primary={this.props.title} disableTypography style={listHeaderStyle} />

            </ListItem>;

        // Values
           
        let valueRows = [];
        for (let propertyValue of this.props.propertyValues) {
            let sty = "" 
            let view = null;
            let titleView = undefined;
            let isEditable = !this.props.nested || this.props.isEditable(propertyValue);
            let classes = ['individualRow'];
            let key = this.props.property.IRI + '_';
            if (propertyValue instanceof Literal) {
                view = <LiteralView literal={propertyValue}
                                    isEditable={isEditable}
                                    onChange={this.props.onLiteralChanged}
                />;
                key += propertyValue.uniqueId 
                if (isEditable) {
                    classes.push('individualLiteralRowEditable');
                } else {
                    classes.push('individualLiteralRow');
                }
                
                sty = "lit" ;
                
                //console.log("view1",view)
                
                
            } else if (propertyValue instanceof Individual ) { 
               
               sty = "ind" ;
               
                const onClick = () => {
                    if (!propertyValue.hasGeneratedId && this.props.onSelectedResource
                       && propertyValue.id.match(/([_A-Z]+[0-9]+)+$/)
                  ) {
                       
                        // here is where to check whether resource is viewable on central panel
//                         console.log("propVal",propertyValue.id,propertyValue)
                        this.props.onSelectedResource(propertyValue.id);
                    }
                }

                for (let range of this.props.property.ranges) {
                    if (range in RDFComponents) {
                        const rdfComponent = RDFComponents[range];
                        titleView = React.createElement(rdfComponent, {
                            onSelectedResource: this.props.onSelectedResource,
                            onClick: onClick,
                            individual: propertyValue,
                            isEditable: false,
                            isExpandable: true,
                            isExpanded: false,
                            level: this.props.level + 1,
                            nested: true,
                            ontology: this.props.ontology,
                        }, null);
//                         console.log("propView",titleView);
                        break;
                    }
                }
                view = <IndividualView 
                            onSelectedResource={this.props.onSelectedResource}
                            onIndividualUpdated={this.props.onIndividualUpdated}
                            onClick={onClick}
                            individual={propertyValue}
                            isEditable={isEditable}
                            isExpandable={true}
                            isExpanded={false}
                            level={this.props.level + 1}
                            nested={true}
                            ontology={this.props.ontology}
                            titleView={titleView}
                            showLabel={true}
                />;
                
                
                //console.log("view2",view)
                
                
                key += propertyValue.id + '_' + propertyValue.uniqueId;
            }

            const onTapRemove = (event) => {
                this.props.individual.removeProperty(this.props.property.IRI, propertyValue);
                if (this.props.onIndividualUpdated) {
                    this.props.onIndividualUpdated();
                }
            };
            let removeButton = "";
            if (isEditable && this.props.title != "ID") {
                removeButton = <IconButton
                    onClick={onTapRemove}
                    className="removeButton"
                >
                    <RemoveCircleIcon style={{...redColor, ...iconSizes.small}}/>
                </IconButton>;
            }

            valueRows.push(<ListItem
                style={listItemStyle}
            >
                {view}
                <ListItemSecondaryAction 
                  className={"remoBut "+sty}
                >{removeButton}</ListItemSecondaryAction> 
            </ListItem>);
            
//              this.props.isExpanded && 
        }

        console.groupEnd();
        
        return (<List> 
            {propertySubheader}
            {valueRows}
         </List> );
    }
}

type Props = {
    onSelectedResource: (id: string) => void,
    onIndividualUpdated?: () => void,
    onAddResource?: (individual: Individual, property: RDFProperty) => void,
    onClick?: () => void,
    individual: Individual,
    isEditable: boolean,
    isExpandable?: boolean,
    isExpanded: boolean,
    level: number,
    nested: boolean,
    ontology: Ontology,
    titleView?: React.Element<*>,
}

type State = {
    collapseState: {},
    isExpanded: boolean
}

export default class IndividualView extends React.Component<Props, State> {
    _editableIndividuals = [];
    _allowExpansion = false ;

    constructor(props: Props) {
        super(props);

        this.state = {
            collapseState: {},
            isExpanded: props.isExpanded
        }
    }
    
     /*
    
   componentWillMount()
   {
        console.log("will mount indiView",this.props.individual.id) 
    }
   componentDidMount()
   {
        console.log("did mount indiView",this.props.individual.id) 
    }
    
   componentWillUpdate()
   {
        console.log("will update indiView",this.props.individual.id) 
    }
   componentDidUpdate()
   {
        console.log("did update indiView",this.props.individual.id) 
    }
   */

    setCollapseState(id: string, open: boolean) {
        const collapseState = {
            ...this.state.collapseState,
            [id]: open
        };
        this.setState((prevState, props) => {
            return {
                ...prevState,
                collapseState
            }
        })
    }

    toggleCollapseState(id: string) {
        let open;
        if (this.state.collapseState[id] === undefined) {
            open = true;
        } else {
            open = !this.state.collapseState[id];
        }

        this.setCollapseState(id, open);
    }

    toggleExpandedState() {
        this.setState((prevState, props) => {
            return {
                ...prevState,
                isExpanded: !prevState.isExpanded
            }
        })
    }

    addProperty(propertyType: string) {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];
        const properties = ontology.getClassProperties(type);
        const property = properties.find((prop: RDFProperty) => prop.IRI === propertyType);
        if (!property || property.ranges.length === 0) {
            return;
        }

        const propertyRange = property.ranges[0];
        if (ontology.isClass(propertyRange)) {
            const propertyIndividual = new Individual();
            propertyIndividual.addType(propertyRange);
            this._editableIndividuals.push(propertyIndividual);
            individual.addProperty(propertyType, propertyIndividual);
        } else {
            const ranges = ontology.getPropertyRanges(propertyType);
            const literal = new Literal(ranges[0], '');
            individual.addProperty(propertyType, literal);
        }
        this.forceUpdate();
        if (this.props.onIndividualUpdated) {
            this.props.onIndividualUpdated();
        }
    }

    removeProperty(propertyType: string, value: any) {
        this.props.individual.removeProperty(propertyType, value);
        this.forceUpdate();
        if (this.props.onIndividualUpdated) {
            this.props.onIndividualUpdated();
        }
    }

    getAvailableProperties(): {} {
        const ontology = this.props.ontology;
        const individual = this.props.individual;
        const type = individual.types[0];

  /*
        console.log("ontology",ontology);
        
        console.log("type",type);
        
        const properties = ontology.getClassProperties(type);
        
        console.log("availableProperties",properties);
        
        const groupedProps = this.getGroupedProperties(properties);
  
        console.log("grouProps",groupedProps);

        const groupedProps = {
            [DATATYPE_PROPERTY.value]: ontology.getPropertiesArray(DATATYPE_PROPERTY),
            [OBJECT_PROPERTY.value]: ontology.getPropertiesArray(OBJECT_PROPERTY),
            [ANNOTATION_PROPERTY.value]: ontology.getPropertiesArray(ANNOTATION_PROPERTY)
        };
*/
        
//         console.log("grouProps",groupedProps);



        return ontology._propertiesArray ;
    }

    getGroupedProperties(properties: RDFProperty[]): {} {
        let dataTypeProps = properties.filter(prop => prop.propertyType === DATATYPE_PROPERTY.value);
        let objectTypeProps = properties.filter(prop => prop.propertyType === OBJECT_PROPERTY.value);
        let annotationTypeProps = properties.filter(prop => prop.propertyType === ANNOTATION_PROPERTY.value);
        const groupedProps = {
            [DATATYPE_PROPERTY.value]: dataTypeProps,
            [OBJECT_PROPERTY.value]: objectTypeProps,
            [ANNOTATION_PROPERTY.value]: annotationTypeProps
        };

        return groupedProps;
    }

    propertyGroupRows(availableProps: RDFProperty[], setProps: {}, removeUnsetProps:boolean=false): Array<mixed> {
       
       
//         console.log("availProp",availableProps)
         
        let rows = [];
        let props = {};
        const availablePropsIRIs = availableProps.map(prop => {
            props[prop.IRI] = prop;
            return prop.IRI;
        });
         
//         console.log("availPropIRI",availablePropsIRIs)
        
//         console.log("propertyList",setProps)
        
        let existingProps = {};
        for (let propKey in setProps) {
           
            if(availablePropsIRIs.indexOf(propKey) === -1) 
            {
               //if (propKey != "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
               //&& propKey != "http://purl.bdrc.io/ontology/admin/status"  )
               {
//                   console.log("skipping",propKey)
                  continue;
               
               }
            }
            
            existingProps[propKey] = setProps[propKey];
            
        }        
        
//         console.log("existProps",existingProps)

        if (!removeUnsetProps) {
            for (let availableProp of availableProps) {
                if (!existingProps[availableProp.IRI] && availableProp.ranges.length > 0) {
                    existingProps[availableProp.IRI] = [];
                }
            }
        }

        let propertyLists = [];
        for (let propertyType in existingProps) {
            let propertyValues = existingProps[propertyType];
            propertyLists.push(this.listForProperty(props[propertyType], propertyValues));
        }
        
       
//        console.groupEnd()
//         console.log("return",propertyLists)
        
         
        return propertyLists;
    }

    listForProperty(property: RDFProperty, propertyValues: Array<mixed>): {} {
       
//         console.log("RDFprop",property);
//         console.log("propValues",propertyValues);
       
        const onLiteralChanged = (event) => {
            if (this.props.onIndividualUpdated) {
                this.props.onIndividualUpdated();
            }
        };
        let tooltip = property.comments.map(comment => comment.comment).join('\n\n');
        let title = (property.label) ? capitalize(property.label) : formatIRI(property.IRI);
        const propIsEditable = this.props.isEditable;
        const isEditable = (propertyValue) => {
            let isEditable = propIsEditable;
            if (propertyValue && propertyValue instanceof Individual) {
                if (this._editableIndividuals.indexOf(propertyValue) !== -1) {
                    isEditable = true;
                } else {
                    isEditable = false;
                }
            }
            return isEditable;
        };

        let onTapAdd = () => this.addProperty(property.IRI);
        for (let range of property.ranges) {
            if (REMOTE_ENTITIES.indexOf(range) !== -1) {
                onTapAdd = this.props.onAddResource;
                break;
            }
        }

        const propertyView = <IndividualProperty
            nested={this.props.nested}
            isEditable={isEditable}
            onIndividualUpdated={this.props.onIndividualUpdated}
            onLiteralChanged={onLiteralChanged}
            onSelectedResource={this.props.onSelectedResource}
            onTapAdd={onTapAdd}
            individual={this.props.individual}
            level={this.props.level}
            ontology={this.props.ontology}
            property={property}
            propertyValues={propertyValues}
            title={title}
            tooltip={tooltip}
            {...this.props.individual.id.match(/([_A-Z]+[0-9]+)+$/) ? { showLabel : true }:{} }
        />;
        
        console.log("propView",propertyView.props.title,propertyView)

        return propertyView;
    }

    getPropertyLists(): (?React.Element<*>)[] {
        let removeUnsetProperties = true;
        if (this.props.isEditable) {
            removeUnsetProperties = true; //false;
        }

        
        
        let availableProperties = this.getAvailableProperties();
        let dataTypeProps = availableProperties[DATATYPE_PROPERTY.value];
        let objectProps = availableProperties[OBJECT_PROPERTY.value];
        let annotationProps = availableProperties[ANNOTATION_PROPERTY.value];
        let properties = this.props.individual.getProperties();

        const objectHeading = '' //(!this.props.nested) ? 'Object Properties' : '';
        let objectRows = this.propertyGroupRows(objectProps, properties, removeUnsetProperties);
        
        const datatypeHeading = '' // (!this.props.nested) ? 'Datatype Properties' : '';
        const datatypeRows = this.propertyGroupRows(dataTypeProps, properties, removeUnsetProperties);
         
        const annotationHeading = '' //(!this.props.nested) ? 'Annotation Properties' : '';
        let annotationRows = this.propertyGroupRows(annotationProps, properties,  removeUnsetProperties);
        
        objectRows.unshift(annotationRows[0])        
        delete annotationRows[0]
        
        
        const propertyTypes = [
            
            {
                heading: objectHeading,
                rows: objectRows
            },
            {
                heading: datatypeHeading,
                rows: datatypeRows
            },
            {
                heading: annotationHeading,
                rows: annotationRows
            }
        ];

        const headingStyles = {
            fontSize: '21px',
            fontWeight: 'bold',
            padding: '10px 0 10px 0',
            margin: '0'
        };

        const dataRowStyle = {
            marginLeft: ((this.props.level + 1) * 20) + 'px'
        };

        let lists: (?React.Element<*>)[] = [];
        for (let [index, propertyData] of propertyTypes.entries()) {
            let collapseId = [this.props.individual.id, 'level', this.props.level, index, 'collapsed'].join('_');

            let handleCollapse = () => {
                this.toggleCollapseState(collapseId);
            };

            //if (this.props.nested) {
                lists.push(
                    <List>
                        {propertyData.rows}
                    </List>
                )
                
            /* // no need anymore
            } else {
                lists.push(
                    <List>
                        <ListItem button onClick={handleCollapse}>
                            <ListItemText
                                disableTypography
                                primary={propertyData.heading}
                                style={headingStyles}
                            />
                            {this.state.collapseState[collapseId] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={this.state.collapseState[collapseId]} style={dataRowStyle} >
                            {propertyData.rows}
                        </Collapse>
                    </List>
                );
            }
            */
        }

        return lists;
    }

    getIdList(): React.Element<*> {
        const idProperty = new RDFProperty('ID');
        const idLiteral = new Literal(STRING_TYPE, this.props.individual.id);
        const propertyValues = [idLiteral];

        //console.log("getId:propVal",propertyValues,this.props.individual.id);
        
        const onChange = (value) => {
            this.props.individual.id = value;
            this.forceUpdate();
            if (this.props.onIndividualUpdated) {
                this.props.onIndividualUpdated();
            }
        };

        return <IndividualProperty
            nested={this.props.nested}            
            isEditable={() => true}
            onIndividualUpdated={this.props.onIndividualUpdated}
            onLiteralChanged={onChange}
            onSelectedResource={this.props.onSelectedResource}
            onTapAdd={this.props.onAddResource}
            individual={this.props.individual}
            level={this.props.level}
            ontology={this.props.ontology}
            property={idProperty}
            propertyValues={propertyValues}
            title={"ID"}
            tooltip={"ID"}
        />;
    }

    getLabelsList(): React.Element<*> | null {
        let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");

        if (!labels) return null;

        const labelProperty = new RDFProperty('http://www.w3.org/2000/01/rdf-schema#label');
        const onLiteralChanged = (event) => {
            if (this.props.onIndividualUpdated) {
                this.props.onIndividualUpdated();
            }
        };

        return (
            <List>
                <IndividualProperty
                    nested={this.props.nested}
                    isEditable={(propertyValue: any) => this.props.nested && this.props.isEditable } 
                    onIndividualUpdated={this.props.onIndividualUpdated}
                    onLiteralChanged={onLiteralChanged}
                    onSelectedResource={this.props.onSelectedResource}
                    onTapAdd={this.props.onAddResource}
                    individual={this.props.individual}
                    level={this.props.level}
                    ontology={this.props.ontology}
                    property={labelProperty}
                    propertyValues={labels}
                    title={"Label"}
                    tooltip={"Labels"}                   
                />
            </List>
        )
    }

   onOpenNewTab(event)  {
//       console.log("NEW",this)
      store.dispatch(ui.editingResourceInNewTab(this.props.individual.id))
   }

         
    getNestedTitleList(): React.Element<*> | null {
       
         if (!this.props.nested && !this.props.titleView) return null;

        let titleView = this.props.titleView;
        if (!titleView) {
            let title = '';
            let subtitle = '';
            let labels = this.props.individual.getProperty("http://www.w3.org/2000/01/rdf-schema#label");
            
//             console.log("labels",labels)
            
            if (labels && labels.length > 0) {
                title = labels[0].value;
            } else if (this.props.individual.id) {
                title = formatIRI(this.props.individual.id);
            } else {
                title = <i>&lt;no id&gt;</i>;
            }

            if (this.props.individual.types[0]) {
                subtitle = formatIRI(this.props.individual.types[0]);
            }
            
            titleView = [ <ListItemText
                  primary={title}
                  secondary={subtitle}
               /> ]
               
            
        }
        else { titleView = [ titleView ] }
        
        
         //if(this.props.showLabel)
         {
            let pref = []
            
            let lab = this.props.individual.getProperty("http://www.w3.org/2004/02/skos/core#prefLabel") ;
            //console.log("label",lab,this.props.individual)
            
            if(lab != null && lab.length > 0)
            {
               for(var l of lab) {
                  pref.push( 
                  <LiteralView literal={l} isEditable={false} noPrefix={true} />
                           );
               }
               
               titleView.push(<div className="prefLabel">{pref}</div>)
            }
         }
    
        this._allowExpansion = this.props.isExpandable && (Object.keys(
                this.props.individual.getProperties()
            ).length > 0
            //|| this.props.isEditable
        );
        let listItem: React.Element<*>;
        if (this._allowExpansion) {
           listItem = []
            listItem.push( <ListItem {...this.props.isEditable ? {className:"noPad"}:{} } button onClick={() => this.toggleExpandedState()}>
                            {titleView}
                            
                            {this.state.isExpanded ? <ExpandLess /> : <ExpandMore />}
            
                              
                       </ListItem>)
                       
           if(this.props.nested && this.props.level == 0)
           {
               listItem.push(
                              <ListItemSecondaryAction className="plusBut"> 
                                 <IconButton
                                    onClick={this.onOpenNewTab.bind(this)}
                                 >
                                       <AddBoxIcon />
                                 </IconButton>
                              </ListItemSecondaryAction> 
                        )
           
            }
                              
        } else {
            listItem = <ListItem  button>
                            {titleView} 
                            
                       </ListItem>
        }
        return(
            <List >
                {listItem}
            </List>
        )
    }

    render() {
       
       
  
        // ID
        let idList = null;
        if (!this.props.nested) {
//            console.log("idList")
            idList = this.getIdList();
        }
        
        console.groupCollapsed("indiView/"+this.props.level+"/render",this.props.individual.id,this.props.individual.types[0])
        console.log(this.props);

        let classes = ["individualView"];
        if (this.props.isEditable) {
            classes.push("isEditable");
        }
        if (this.props.isExpanded) {
            classes.push("isExpanded");
        }
        /*
        if(this._allowExpansion){
           classes.push("expan")
         } else {
           classes.push("noExpan")       
         }
         */
        
        console.log("props",this.props);
        
        console.group("getProp");
        const propList = this.getPropertyLists();
        console.groupEnd();
        console.group("getLab");
        const labList = this.getLabelsList()
        console.groupEnd();
        
        console.log("labList",labList);
        console.log("propList",propList);
        
        let ret = (
            <div className={classnames(...classes)} onClick={this.props.onClick}>
                {this.getNestedTitleList()}
                <Collapse in={this.state.isExpanded} >
                    {idList}
                    {labList}
                    {propList}
                </Collapse>                
            </div>
        );
        

         console.groupEnd()
         
        return ret ;
        
    }
}
