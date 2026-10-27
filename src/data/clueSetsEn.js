const E = (label, text) => ({
  label, lang: "en",
  entries: text.trim().split("\n").map((l) => {
    const i = l.indexOf(":");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
});

export const SETS_EN = {
  en_animals: E("Animals (English)", `
LION: Big cat whose male has a thick mane
TIGER: Large wild cat with orange fur and black stripes
ELEPHANT: Largest land animal, it has a trunk
GIRAFFE: Tallest animal, with a very long neck
MONKEY: Playful climber that loves bananas
ZEBRA: Horse-like animal with black and white stripes
HIPPO: Large grey animal that spends the day in water
RHINO: Thick-skinned animal with a horn on its nose
CHEETAH: Fastest land animal
LEOPARD: Spotted big cat that rests in trees
KANGAROO: Hopping animal from Australia with a pouch
KOALA: Sleepy Australian animal that eats eucalyptus leaves
PANDA: Black and white bear that eats bamboo
PENGUIN: Bird that swims but cannot fly
DOLPHIN: Clever sea mammal that clicks and whistles
WHALE: Biggest animal in the sea
SHARK: Fish with sharp teeth and a fin on its back
TURTLE: Reptile that carries a shell
CROCODILE: Large reptile with strong jaws that lives near rivers
SNAKE: Long reptile with no legs
EAGLE: Large bird of prey with sharp eyes
PARROT: Colourful bird that can copy words
OWL: Night bird that says hoot
RABBIT: Furry hopper with long ears
SQUIRREL: Small animal with a bushy tail that collects nuts
HEDGEHOG: Small spiny animal that curls into a ball
BEAR: Large furry animal that sleeps through winter
WOLF: Wild relative of the dog that howls
FOX: Clever wild animal with a bushy tail
DEER: Forest animal, the male has antlers
MOOSE: Largest member of the deer family
CAMEL: Desert animal with humps
GORILLA: Largest of the apes
OTTER: Playful swimmer that floats on its back
BEAVER: Animal that builds dams in rivers
FLAMINGO: Pink bird that stands on one leg
PEACOCK: Male bird with a fan of colourful tail feathers
LIZARD: Small reptile that can drop its tail
FROG: Pond animal that jumps and croaks
BUTTERFLY: Insect with colourful wings that was once a caterpillar
CAT: Pet that purrs and says meow
DOG: Pet known as a best friend
COW: Farm animal that gives milk
PIG: Farm animal that says oink
HORSE: Animal you can ride that says neigh
SHEEP: Farm animal that gives us wool
GOAT: Farm animal with a beard that bleats
DUCK: Bird that says quack
HEN: Female chicken that lays eggs
BEE: Insect that makes honey
ANT: Tiny insect that lives in a colony
SPIDER: Eight-legged creature that spins a web
MOUSE: Small rodent that squeaks
CRAB: Sea animal that walks sideways
SEAL: Sea mammal that barks and swims
FISH: Animal that lives in water and has gills
TOAD: Bumpy cousin of the frog
BAT: Flying mammal that sleeps upside down
SWAN: Graceful white water bird with a long neck
`),

  en_fruitveg: E("Fruits and Vegetables (English)", `
APPLE: Red or green fruit that grows on trees
BANANA: Long yellow fruit that monkeys love
ORANGE: Round citrus fruit with the same name as its colour
GRAPE: Small fruit that grows in bunches
MANGO: Sweet tropical fruit with a large flat seed
PINEAPPLE: Tropical fruit with a spiky crown
STRAWBERRY: Red berry with seeds on the outside
BLUEBERRY: Small round blue berry
RASPBERRY: Soft red berry often used in jam
CHERRY: Small red fruit with a stone inside
PEACH: Fuzzy-skinned fruit with a large stone
PEAR: Fruit shaped like a bell with a narrow top
PLUM: Purple fruit that becomes a prune when dried
LEMON: Sour yellow citrus fruit
LIME: Small sour green citrus fruit
COCONUT: Hairy brown fruit with milky water inside
PAPAYA: Orange tropical fruit with black seeds
KIWI: Brown fuzzy fruit with green flesh
MELON: Large juicy fruit such as honeydew
WATERMELON: Big green fruit with red flesh and black seeds
APRICOT: Small orange fruit that looks like a little peach
GUAVA: Tropical fruit with many small seeds
LYCHEE: Small fruit with rough red skin and white flesh
DURIAN: Spiky fruit with a very strong smell
AVOCADO: Green fruit used to make guacamole
CARROT: Orange root vegetable that rabbits love
POTATO: Starchy vegetable used for fries and chips
TOMATO: Red fruit often used as a vegetable
ONION: Layered vegetable that can make you cry
GARLIC: Strong-smelling bulb used in cooking
CELERY: Crunchy green stalks
LETTUCE: Leafy green used in salads
SPINACH: Dark green leafy vegetable rich in iron
BROCCOLI: Green vegetable that looks like tiny trees
CABBAGE: Round leafy vegetable used in coleslaw
CUCUMBER: Long green vegetable that is cool and crunchy
PEPPER: Can be sweet and red or hot and spicy
PUMPKIN: Big orange vegetable carved at Halloween
CORN: Yellow kernels on a cob
PEAS: Small green seeds that grow in a pod
EGGPLANT: Purple vegetable also called aubergine
RADISH: Small red root with a peppery taste
MUSHROOM: Fungus that is cooked as a vegetable
GINGER: Spicy root used in tea and cooking
`),

  en_food: E("Food (English)", `
PIZZA: Round Italian dish topped with cheese and tomato
BURGER: Patty in a bun, often with lettuce and cheese
PASTA: Italian food that includes spaghetti and macaroni
SALAD: Dish of mixed raw vegetables
SANDWICH: Filling between two slices of bread
TACO: Folded tortilla with a filling
SUSHI: Japanese dish of rice with fish or vegetables
NOODLES: Long thin strips of dough served in soup
RICE: Small white grains eaten with many meals
SOUP: Hot liquid food eaten with a spoon
STEAK: Thick slice of grilled beef
BACON: Crispy strips of pork eaten at breakfast
PANCAKE: Flat round cake cooked in a pan
WAFFLE: Breakfast treat with a grid pattern
CEREAL: Breakfast food eaten with milk
YOGURT: Creamy dairy food made from fermented milk
CHEESE: Dairy food made from milk, often yellow
BREAD: Baked from flour and eaten as toast
BAGEL: Round bread roll with a hole in the middle
DONUT: Sweet ring with icing
COOKIE: Small sweet baked treat
BROWNIE: Dense chocolate square cake
CUPCAKE: Small cake baked in a paper cup
MUFFIN: Small round cake, often with blueberries
POPCORN: Snack that pops when heated
PRETZEL: Salty baked snack twisted in a knot
NACHOS: Tortilla chips topped with cheese
LASAGNA: Layered pasta baked with sauce and cheese
MEATBALL: Round ball of minced meat
SAUSAGE: Ground meat packed in a casing
FRIES: Thin sticks of potato served hot
CURRY: Spicy dish with a rich sauce
DUMPLING: Dough wrapped around a filling
CHOCOLATE: Sweet brown treat made from cocoa
HONEY: Sweet golden food made by bees
BUTTER: Yellow spread made from cream
EGG: Laid by a hen and eaten boiled or fried
JAM: Sweet fruit spread for bread
SYRUP: Thick sweet liquid poured on pancakes
SUGAR: Sweet white crystals added to drinks
SALT: White seasoning for chips and fries
TOAST: Bread browned until crisp
OMELET: Beaten eggs cooked flat and folded
`),
};
