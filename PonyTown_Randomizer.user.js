// ==UserScript==
// @name        PonyTown Character Randomizer
// @namespace   azedith
// @include     https://pony.town/*
// @author      @NotMyWing
// @version     0.29.0pre1
// @grant       unsafeWindow
// @require     https://cdnjs.cloudflare.com/ajax/libs/color-scheme/1.0.0/color-scheme.min.js
// @require     https://raw.githubusercontent.com/bgrins/TinyColor/master/tinycolor.js
// @require     https://cdn.jsdelivr.net/npm/tinygradient@0.3.0/tinygradient.min.js
// ==/UserScript==

(function(window) {
    if (!window) return;

    var observer_target = document.querySelector('pony-town-app');

    if (!observer_target) {
        return;
    }

    function randomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    var rgb2hex = (r, g, b) => ((1 << 24 | Math.ceil(r) << 16 | Math.ceil(g) << 8 | Math.ceil(b)) >>> 0).toString(16).substr(1);

    var hex2rgb = (hex) => {
        var a = hex.startsWith("#") ? 1 : 0;
        var r = parseInt(hex.slice(0 + a, 2 + a), 16),
            g = parseInt(hex.slice(2 + a, 4 + a), 16),
            b = parseInt(hex.slice(4 + a, 6 + a), 16);

        return [r, g, b];
    }

    var RACE = {
        // --
        EARTH: 1,
        UNICORN: 2,
        PEGASUS: 3,
        BAT: 4,
        VAMPIRE: 5,
        // --
        DEER: 6,
        MOOSE: 7,
        // --
        DRAGON: 8,
        // --
        LING: 9,
        // --
        GRIFFON: 10,
        HIPPOGRIFF: 11,
        // --
        LING_REFORMED: 12
    }

    // SJWs begone.
    var GENDER = {
        MARE: 1,
        STALLION: 2
    }

    var clamp = (a, min, max) => a > max ? max : (a < min ? min : a);

    function color_multiply(r, g, b, mul) {
        r = Math.ceil(r * mul);
        g = Math.ceil(g * mul);
        b = Math.ceil(b * mul);
        return [r, g, b];
    }

    function outlinify(r, g, b, type) {
        type = type || 0;

        // Kludge?
        if (typeof(r) == "object") {
            type = g || 0;

            return r.map((x) => {
                var [r, g, b] = hex2rgb(x);
                [r, g, b] = outlinify(r, g, b);
                return rgb2hex(r, g, b);
            });
        }
        // How should outline look like?
        switch (type) {
            case 0: // Equal to main color
                var mul = (5 / 8);

                r = Math.ceil(r / mul);
                g = Math.ceil(g / mul);
                b = Math.ceil(b / mul);
                break;

            case 1: // Randomly darker or lighter than main.
                var mul = (Math.random() / 2) + 0.75;
                r = Math.ceil(r * mul);
                g = Math.ceil(g * mul);
                b = Math.ceil(b * mul);
                break;

        }
        console.log(r, g, b);
        return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
    }

    var generators = {
        normal: {
            generate: function(data, config) {
                var prefs = {};

                prefs.outline_type = randomArbitrary(0, 2);
                // Generate body
                data.Body = (function() {
                    var data = {};

                    data.Color = config.colors[0];
                    var outline_type = randomArbitrary(0, 3);
                    switch (outline_type) {
                        case 0:
                            data.Outline = config.colors[2];
                            break;
                        default:
                            var [r, g, b] = hex2rgb(config.colors[0]);
                            [r, g, b] = outlinify(r, g, b, outline_type);
                            data.Outline = rgb2hex(r, g, b);
                            break;
                    }
                    if (config.race == RACE.UNICORN) {
                        data.Horn = {
                            Type: randomArbitrary(1, 4)
                        }
                    } else if (config.race == RACE.PEGASUS) {
                        data.Wings = {
                            Type: 1
                        }
                    } else if (config.race == RACE.BAT) {
                        data.Ears = {
                            Type: 1
                        }

                        var [r, g, b] = hex2rgb(config.colors[1]);
                        [r, g, b] = color_multiply(r, g, b, 0.85);
                        var bones_color = rgb2hex(r, g, b);
                        [r, g, b] = outlinify(r, g, b);
                        var bones_outline = rgb2hex(r, g, b);
                        data.Wings = {
                            Type: 2,
                            Colors: [
                                bones_color, config.colors[2]
                            ],
                            Outlines: [
                                bones_outline, config.colors[2]
                            ]
                        }
                    } else if (config.race == RACE.VAMPIRE) {
                        data.Ears = {
                            Type: 1
                        }

                        data.Wings = {
                            Type: 2,
                            Colors: [
                                data.Color, config.colors[2]
                            ],
                            Outlines: [
                                data.Outline, config.colors[2]
                            ]
                        }
                    }

                    if (config.gender == GENDER.STALLION) {
                        var [r, g, b] = hex2rgb(config.colors[1]);

                        [r, g, b] = color_multiply(r, g, b, 0.85);
                        var hooves_color = rgb2hex(r, g, b);

                        [r, g, b] = outlinify(r, g, b);
                        var hooves_outline = rgb2hex(r, g, b);
                        data.FrontHooves = {
                            Type: 1,
                            Colors: [
                                hooves_color
                            ],
                            Outlines: [
                                hooves_outline
                            ]
                        }

                        data.BackHooves = {
                            Type: 1
                        }
                    }

                    return data;
                })();

                // Generate mane
                data.Mane = (function() {
                    var data = {};

                    var type = randomArbitrary(0, 3),
                        colors = [],
                        outlines = [];

                    var primary = '#' + config.colors[4];
                    var secondary = '#' + config.colors[5];
                    type = 1;

                    switch (type) {
                        case 0: // Plain
                            colors = [primary];
                            break;

                        case 1: // Gradient
                            var g = tinygradient([
                                primary,
                                secondary
                            ]).rgb(6);
                            console.log(g)
                            colors = g.map((x) => x.toHexString()).map((x) => x.substring(1));
                            break;

                        case 2: // Random distributed shades
                            break;
                    }

                    var mane_pattern = randomArbitrary(1, 8);
                    data.Mane = {
                        Type: randomArbitrary(1, 25),
                        Pattern: mane_pattern,
                        Colors: colors,
                        Outlines: outlinify(colors)
                    };

                    data.Backmane = {
                        Type: randomArbitrary(1, 21),
                        Pattern: mane_pattern,
                        Colors: colors,
                        Outlines: outlinify(colors)
                    };

                    return data;
                })();

                // Generate Tail
                data.Tail = (function(g) {
                    var data = {};

                    if (config.race == RACE.DEER) {
                        data.Tail = {
                            Type: 16
                        };
                    } else {
                        var tail;
                        do {
                            tail = randomArbitrary(1, 24);
                        } while (tail == 13 ||
                            tail == 15 ||
                            tail == 16 ||
                            tail == 17 ||
                            tail == 18 ||
                            tail == 19)

                        data.Tail = {
                            Type: tail,
                            Pattern: randomArbitrary(1, 8),
                            Colors: g.Mane.Mane.Colors,
                            Outlines: g.Mane.Mane.Outlines
                        };
                    }


                    return data;
                })(data);

                data.Face = (function(g, config) {
                    let data = {};
                    if (config.race == RACE.VAMPIRE || config.race == RACE.BAT)
                        data.Fangs = 1;

                    return data;
                })(data, config);
            }
        }
    };

    function generateRandomPony() {
        var data = {};

        var config = {
            race: randomArbitrary(1, 12),
            colors: (function() {
                var scheme = new ColorScheme;

                var variation;
                if (this.race == RACE.BAT || this.race == RACE.VAMPIRE) {
                    variation = 'pale';
                } else {
                    switch (randomArbitrary(0, 4)) {
                        case 0:
                            variation = 'pastel';
                            break;
                        case 1:
                            variation = 'default';
                            break;
                        case 2:
                            variation = 'pale';
                            break;
                        case 3:
                            variation = 'soft';
                            break;
                    }
                }
                scheme.from_hue(randomArbitrary(0, 360))
                    .scheme('contrast')
                    .variation(variation);

                return scheme.colors();
            })(),

            gender: randomArbitrary(1, 3)
        }

        // Placeholder
        config.race = randomArbitrary(1, 6);

        // Use normal generator.
        if (config.race >= 1 && config.race <= 5) {
            generators.normal.generate(data, config);
        }

        data.Body = data.Body || {};
        data.Body.OutlinesEnabled = true;
        return data;
    }

    var Injection = {
        InjectButton: function(target) {
            if (!(window.NMW || {}).Character)
                return;

            var button = document.createElement('button');
            button.classList.add('btn');
            button.classList.add('btn-lg');
            button.classList.add('btn-default');
            button.classList.add('ml-1');
            button.innerHTML = 'Randomize';
            button.onclick = function() {
                window.NMW.Character.Import(generateRandomPony());
            };

            target.appendChild(button);
        }
    };

    // Setup observer.
    var observer = new MutationObserver(function(mutations) {
        var injected = false;

        for (var i = 0; i < mutations.length; i++) {
            var element = mutations[i].target;

            if (!injected &&
                mutations[i].removedNodes.length === 0 &&
                element.tagName == 'CHARACTER') {

                var e = document.querySelector('character > div > div.text-center > div.form-group');

                if (e) {
                    Injection.InjectButton(e);
                }
            }
        }
    });

    observer.observe(observer_target, {
        childList: true,
        subtree: true
    });
})(unsafeWindow || window || null);
