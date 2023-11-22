

const cardsContainer = document.querySelector(".cards");
const cardsContainerInner = document.querySelector(".cards__inner");
const cards = Array.from(document.querySelectorAll(".card"));
const overlay = document.querySelector(".overlay");

const applyOverlayMask = (e) => {
  const overlayEl = e.currentTarget;
  const x = e.pageX - cardsContainer.offsetLeft;
  const y = e.pageY - cardsContainer.offsetTop;

  overlayEl.style = `--opacity: 1; --x: ${x}px; --y:${y}px;`;
};

const createOverlayCta = (overlayCard, ctaEl) => {
  const overlayCta = document.createElement("div");
  overlayCta.classList.add("cta");
  overlayCta.textContent = ctaEl.textContent;
  overlayCta.setAttribute("aria-hidden", true);
  overlayCard.append(overlayCta);
};

const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const cardIndex = cards.indexOf(entry.target);
    let width = entry.borderBoxSize[0].inlineSize;
    let height = entry.borderBoxSize[0].blockSize;

    if (cardIndex >= 0) {
      overlay.children[cardIndex].style.width = `${width}px`;
      overlay.children[cardIndex].style.height = `${height}px`;
    }
  });
});

const initOverlayCard = (cardEl) => {
  const overlayCard = document.createElement("div");
  overlayCard.classList.add("card");
  createOverlayCta(overlayCard, cardEl.lastElementChild);
  overlay.append(overlayCard);
  observer.observe(cardEl);
};

cards.forEach(initOverlayCard);
document.body.addEventListener("pointermove", applyOverlayMask);

//razorpay payment gatway


const modalBtn = document.querySelectorAll(".modal-btn");
modalBtn.forEach(function(over) {
  over.addEventListener("click" , function(){
    let plan = this.getAttribute("value")
   
  

   let planData = {
    ...user_data,plan
   } 

   console.log(planData)
    $.ajax({
			url:"/api/subscribe",
			type:"POST",
			data: planData,
			success:function(res){
				if(res.success){
					var options = {

						"key": ""+res.key_id+"",
						"amount": ""+res.amount+"",
						"currency": "INR",
						"name": ""+res.name+"",
						"order_id": ""+res.order_id+"",
            
							// Success function   
						"handler": function (response){
							alert("Payment Succeeded");   
              $.ajax({
                url:"/api/updatePlan",
                type:"POST",
                data: planData,
              })        
              window.open("/userPage","_self")
						},
						"prefill": {
							"contact":""+res.contact+"",
							"name": ""+res.name+"",
							"email": ""+res.email+""
						},
						"notes" : {
							"description":""+res.description+""
						},
						"theme": {
							"color": "#2300a3"
						}
					};
					var razorpayObject = new Razorpay(options);
					razorpayObject.on('payment.failed', function (response){
            //payment fail fuction
							alert("Payment Failed");
					});
					razorpayObject.open();
				}
				else{
					alert(res.msg);
				}
			}
		})






   })
});




//    insert plans info


window.onload = $.ajax({
  url:"/api/planData",
  type:"get",
  success:function(res){ 
    let resPrice = [res.basic,res.pro,res.ultimate];
    let price = document.querySelectorAll('.card__price');
for(let i=0;i<3;i++){
  price[i].innerHTML=` &#8377; ${resPrice[i]}`
}
  
  }}
)