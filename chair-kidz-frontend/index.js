const allKidsLink = `http://localhost:3000/api/v1/kids`
const chairKidLink = `http://localhost:3000/api/v1/kids/chair`
const voteKidLink = `http://localhost:3000/api/v1/kids/vote`
const throneKidLink = `http://localhost:3000/api/v1/kids/throne`

document.addEventListener('DOMContentLoaded', () => {

  //FEATURE: display list of kids in dropdown list
  // identify elements to modify
  const chairsContainer = document.getElementById('chairs-container');
  const dropdown = document.getElementById('kid-options');
  const throneDiv = document.getElementById('throne');

  function clearPage(){
    chairsContainer.innerHTML = '';
    throneDiv.innerHTML = '';
  };

  // callback function to render data
  function addToDOM(kid) {
    return `
    <div id=${kid.id}-container class="kid-chair-container">
      <img class="image" src=${kid.attributes['img-url']} />
      <br>
      <br>
      <div data-id=${kid.id} data-votes=${kid.attributes['votes']} class="attribute">
        ${kid.attributes['name']}
        <br>
        Votes: ${kid.attributes['votes']}
        <br>
        <a class="vote-down" href="#">Vote Down</a> | <a class="vote-up" href="#">Vote Up</a>
        <br>
        <a class="hide" href="#">Hide</a>
      </div>
    </div>
    `
  };

  function renderKid(kid){
    //reset DOM
    //check in-chair attribute
    if(kid.attributes['throne']){
      throneDiv.innerHTML = `
      <img class="image" src=${kid.attributes['img-url']} />
      <br>
      ${kid.attributes['name']}
      `
    } else if(kid.attributes['in-chair']){
      chairsContainer.innerHTML += addToDOM(kid);
    } else {
      dropdown.options[dropdown.options.length] = new Option(`${kid.attributes['name']}`, `${kid.id}`)
      dropdown.options[dropdown.options.length-1].id = `kidOption${kid.id}`
    }
  };

  function load(){
    fetch(allKidsLink)
      .then(res => res.json())
      .then(json => {
        let kids = json.data
        kids.forEach(kid => renderKid(kid))
      });
  };

  load();

  //FEATURE: selecting a kid and pressing add will place them in a chair on the DOM
  // send patch req to backend, changing in_chair to true
  const addBtn = document.getElementById('add-kid');
  addBtn.addEventListener('click', (e) => {
    let selection = e.target.previousElementSibling
    // console.log(selection)
    let kidId = selection.value

    fetch(chairKidLink,{
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({kid_id: `${kidId}`})
    })
    .then(clearPage)
    .then(load)
  });

  //FEATURE: hide kid
  // clicking the hide link will take the kid move the kid from the DOM back to the dropdown
  // in_chair patched to false to kids/:id
  chairsContainer.addEventListener('click',(e) => {
    e.preventDefault();
    let chairCard = e.target.parentNode
    let kidId = chairCard.dataset.id

    if(e.target.className === 'hide'){
      fetch(chairKidLink,{
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({kid_id: `${kidId}`})
      })
      chairCard.parentNode.remove()
    }
  });

  //FEATURE: voting
  // clicking vote witll change vote count on DOM and backend
  // send patch req to kids/:id and "direction" of vote (up or down)

  //decrease vote callback
  function downvote(kidId){
    fetch(voteKidLink,{
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        kid_id: `${kidId}`,
        vote: 'down'
      })
    })
    //dynamically edit vote count
    .then(clearPage)
    .then(load)
  };

  //increase vote callback
  function upvote(kidId){
      fetch(voteKidLink,{
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        kid_id: kidId,
        vote: 'up'
      })
    })
    .then(clearPage)
    .then(load)
  };

  //FEATURE: vote count 5
  // if vote count reaches 5, move them to the throne, replacing the previous kid
  // the previous kid should reappear in a normal chair within chairs-container
  // send patch req to kids/:id to set throne attribute to true / false
  // votes are reset to 0 when throne: true
  // throne cannot be voted on
  function moveToThrone(kidId){
    console.log('trying to throne')
    console.log(kidId)
    fetch(throneKidLink,{
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        kid_id: kidId
      })
    })
    .then(clearPage)
    .then(load)
  };

  //FEATURE: vote count -5
  // if vote count reaches -5 they will be DELETED from the DOM and backend
  // send delete req to kids/:id
  function deleteKid(kidId){
    fetch(allKidsLink,{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kid_id: kidId
      })
  })
    .then(clearPage)
    .then(load)
  };

  //on click
  chairsContainer.addEventListener('click', (e) => {
    e.preventDefault();
    if(e.target.className === 'vote-down' || e.target.className === 'vote-up'){
      let chairCard = e.target.parentNode
      let kidId = chairCard.dataset.id
      console.log(kidId)
      let voteCount = chairCard.dataset.votes
      console.log(voteCount)
      // console.log(chairCard.innerHTML)
      if(e.target.className === 'vote-down'){
        if(voteCount == '-4'){
          deleteKid(kidId)
        } else {
          downvote(kidId)
        }
      } else if(e.target.className === 'vote-up') {
        if(voteCount == '4'){
          moveToThrone(kidId)
        } else {
          upvote(kidId)
        }
      }
    }
  });

  //FEATURE: create new kid
  // can use form to create new kid
  // new kid will automatically appear on the DOM and a chair will be added to the db
  const nameInput = document.getElementById('new-name');
  const imgInput = document.getElementById('new-image');
  const createBtn = document.getElementById('create-kid');

  createBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createKid()
    console.log(nameInput);
    console.log()
  });

  function createKid() {
    debugger
    fetch(allKidsLink,{
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: nameInput.value,
        img_url: imgInput.value
      })
    })
    .then(clearPage)
    .then(load);
  }

});
