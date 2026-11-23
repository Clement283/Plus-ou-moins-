/* Droite graduée (jauge du jour). Rendu : renderNumberLine(element, minutes, objectif=15).
   Une graduation par minute ; l'objectif est marqué en vert ; au-delà, la droite s'allonge
   par pas de 5 minutes. Classes définies dans styles.css (.number-line*). */
function renderNumberLine(el, minutes, objectif){
  objectif = objectif || 15;
  var max = Math.max(objectif, Math.ceil(minutes / 5) * 5);
  var pct = function (v) { return (v / max * 100) + '%'; };
  var h = '<div class="number-line__axis"><div class="number-line__track"></div>' +
          '<div class="number-line__fill" style="width:' + pct(Math.min(minutes, max)) + '"></div>';
  for (var i = 0; i <= max; i++) {
    var cls = 'number-line__tick';
    if (i === objectif) cls += ' is-goal';
    else if (i % 5 === 0) cls += ' is-major';
    else if (i <= minutes) cls += ' is-passed';
    h += '<i class="' + cls + '" style="left:' + pct(i) + '"></i>';
    if (i % 5 === 0) h += '<span class="number-line__num" style="left:' + pct(i) + '">' + i + '</span>';
  }
  h += '<span class="number-line__cursor' + (minutes >= objectif ? ' is-goal' : '') + '" style="left:' + pct(minutes) + '">' + minutes + ' min</span></div>';
  el.classList.add('number-line');
  el.innerHTML = h;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', minutes + ' minutes sur ' + objectif);
}
