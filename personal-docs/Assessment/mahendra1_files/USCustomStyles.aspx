
.dividerContainer, .childDividerContainer, .dividerButtons, .dividerVerticalMenuButton, .nodeButtons, .tabButtons, .searchContainer,.searchAndDividerButtonContainer
{
  background-color: #FE5000; /*System BG Color*/	
}

.header, .wizardHeader
{
  background-image: url(../images/USHeaderLogo.png); 
}

#companyLogo {                                  
	display: list-item;               
	list-style-image: url(../images/USHeaderLogo.png); 
	list-style-position: inside;
}

/**** Primary Navigation *****/
.primary > a, ul.megamenu li.currentDivider > a
{
	color:#000000;	/*Divider text color*/
}
/**** END Primary Navigation **/

/*** 2nd and 3rd Level Navigation **/
.nodeContainer, .tabContainer, .nodeButtons, .tabButtons 
{
    background-color:#404040;/*When color config is active make 2nd level background dark grey*/
}
.nodes ul li{ /*changes tabs and sub-menu text color*/
    background-color:#F2F2F2;
    border-top:1px solid #F2F2F2;
}

.nodes li.currentNode, .nodes li:hover {
    /*current 2nd level tab should be white with black text*/
}
.nodes li.currentNode a, .nodes li.currentNode a:visited, li.currentTab a, li.currentTab a:visited{
    color:black; 
    font-weight:bold;
}
.nodes a:link, .nodes a:visited
{
    color:#00ADF2;
}
.nodes a:hover{
    color:black;
}

/*** END 2nd and 3rd Level navigation **/
.poweredByLogo label, .poweredByLogo a /*this is only if custom system BG and text color is modified... */ 
{
  color:#000;
}
/*** Wizard styles **/
.contentBoxBody .wizardnavlist .wizardSelected /*Customized navigation background will go on Active Wizard steps*/
{
    background:url("../images/navHighlight.png") repeat-x scroll top left #FE5000; /*System BG Color*/
}
.contentBoxBody .wizardnavlist .wizardSelected a, .contentBoxBody .wizardnavlist .wizardSelected a:hover /*Custom Font color will go on Active wizard step*/
{
    color:#000000;
    border-bottom:1px solid #FE5000;
    border-top:1px solid #FE5000;
    text-shadow:none;

}

li.primary /* This style should only be applied if a custom background color for the primary navigation is being used! */ 
                        { 
                            text-shadow: none; 
                        }