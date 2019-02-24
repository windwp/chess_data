
import * as fs from 'fs';
import SpreadReader from './spread_reader';
const SPREAD_ID = '10m0VyWruJ2AnDMheZsU_hu4o8C_AGJYBt0Kztx37Vwk';
const reader = new SpreadReader();
const outputFile = './output/hero_data.json';
const targetFile = "../autochess/assets/data/hero_data.json";
interface Hero {
    price?: number;
    classHero?: string[];
    image?: string;
    skills?: string[];
    name?: string[];
}
let heros_data: Hero[] = [];
reader.init().then(() => {
    console.log('connect done');
    reader.readSheet(SPREAD_ID, "Hero!A2:G")
        .then((rows) => {
            rows.map((row: any, index: number) => {
                if (index === 0) return;
                const hero: Hero = {};
                try {
                    hero.name = row[0];
                    hero.classHero = [];
                    hero.price = parseInt(row[1])
                    hero.classHero.push(row[2]);
                    hero.classHero.push(row[3]);
                    if (row[4]) {
                        hero.classHero.push(row[4])
                    }
                    hero.image = row[5];
                    heros_data.push(hero);
                    console.log(hero)
                }
                catch (error) {
                    console.log("Error Hero", row[0]);
                }
            });

            writeFile(heros_data);
        })

})
function writeFile(data: any) {
    fs.writeFile(outputFile, JSON.stringify(data), () => {
        console.log('write file done')
    });
    fs.writeFile(targetFile, JSON.stringify(data), () => { })

}