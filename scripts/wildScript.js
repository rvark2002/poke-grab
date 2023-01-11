
class Pokemon{
  constructor(name, level, sprite){
      this.name = name;
      this.level = level;
      this.sprite = sprite;

  }
}

let randomPokemon = Math.floor(Math.random() * 893) + 1;
let randomLvl = Math.floor(Math.random() * 100) + 1;
let pokeName = "";
let pokeSprite = ""
let url = 'https://pokeapi.co/api/v2/pokemon/'+randomPokemon+'/';
function wild(url){
      try {
        fetch(url)
          .then(response => response.json())
          .then(pokemon => {
            console.log(pokemon);
            pokeName = String(pokemon.name).charAt(0).toUpperCase();
            pokeName+=String(pokemon.name).substring(1);

            pokeSprite = pokemon.sprites.front_default;

            document.getElementById('wild').innerHTML = ''
            document.getElementById('wild')
              .innerHTML = 
                `
                  <h2>A Wild ${pokeName} Appeared!</h2> 
                  <h3>lvl ${randomLvl}</h3>
                  <img src="${pokemon.sprites.front_default}" />
                `    ;

            document.getElementById("pokeName").value = pokeName;
            document.getElementById("pokeLvl").value = randomLvl;
            document.getElementById("pokeImg").value = pokemon.sprites.front_default;
            document.getElementById("pokeLink").value = url;
            })
          .catch(error => {
            console.error(error)
          })
      } catch (error) {
        console.error(error)
      }
    }

wild(url);


