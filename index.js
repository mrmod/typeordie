import React from 'react'
import ReactDOM from 'react-dom'

import {Engine, Render, Runner,
    World, Bodies, Body} from 'matter-js'

import {colorNameList as colors} from 'color-name-list'

import {TextField, Typography, Grid, Paper} from "@material-ui/core"
/**
 * Creates a ball in a random color
 */
const createBall = () => {
    const color = colors[Math.floor(Math.random() * Math.floor(colors.length))]

    return Bodies.circle(60, 450, 25, {
        restitution: 0.9, // elasticity
        frictionAir: 0.008,
        density: 0.08,
        render: {
            fillStyle: color.hex,
        }
    })
}
const launchBall = (ball) => {
    Body.applyForce(ball, {x: 60, y: 450}, {x: 5, y: -3.5})
}

const quotes = [
    {
        text: "Wine is constant proof that God loves us and loves to see us happy.",
        person: "Benjamin Franklin",
    },
    {
        text: "If you want your children to listen, try talking softly to someone else.",
        person: "Ann Landers",
    },
    {
        text: "The difference between stupidity and genius is that genius has its limits.",
        person: "Albert Einstein",
    },
    {
        text: "The world is full of magical things patiently waiting for our wits to grow sharper.",
        person: "Betrand Russell",
    },
    {
        text: "There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable.There is another theory which states that this has already happened.",
        person: "Douglas Adams",
    },
    {
        text: "A woman is like a tea bag – you can’t tell how strong she is until you put her in hot water.",
        person: "Eleanor Roosevelt",
    },
    {
        text: "A computer once beat me at chess, but it was no match for me at kick boxing.",
        person: "Emo Philips",
    },
    {
        text: "Never go to a doctor whose office plants have died.",
        person: "Erma Bombeck",
    }
]

const engine = Engine.create({})

const TypingGame = (props) => {
    const [quoteId, setQuoteId] = React.useState(0)
    const [quote, setQuote] = React.useState(quotes[quoteId])

    const [hasStarted, setHasStarted] = React.useState(false)
    const [typedContent, setTypedContent] = React.useState('')

    // Indexes of mistyped characters
    const [typedErrors, setTypedErrors] = React.useState([])
    const [hasErrors, setHasErrors] = React.useState(false)

    const updateTypedContent = (event, value) => {
        if (!hasStarted) {
            setHasStarted(true)
        }

        const typePosition = typedContent.length
        const quoteChar = [...quote.text][typePosition]
        const typedChar = event.target.value.slice(event.target.value.length - 1)

        if (quoteChar === typedChar || event.target.value === quote.text.slice(0, event.target.value.length)) {
            if (event.target.value === quote.text.slice(0, event.target.value.length)) {
                if (!hasErrors && event.target.value.length >= typedContent.length) {
                    props.addBall()
                }

                setHasErrors(false)
                setTypedErrors([])
            }

        } else {
            setHasErrors(true)
            setTypedErrors(typedErrors.concat([typePosition]))
        }
        setTypedContent(event.target.value)
    }

    React.useEffect(() => {
        if (typedContent === quote.text && quoteId < quotes.length) {
            const nextQuoteId = quoteId + 1
            setHasStarted(false)
            setQuoteId(nextQuoteId)
            setQuote(quotes[nextQuoteId])
            setTypedContent("")
        }
    }, [typedContent])

    return (<Grid container>

        <Grid xs={12} item>
            <Paper square={true} variant="outlined">
                <Typography variant="h2">Type This</Typography>
                <Typography variant="h4">{quote.text}</Typography>
            </Paper>
        </Grid>

        <Grid xs={12} item>
            <br />
            <Paper square={true} variant="outlined">
                <Typography variant="h2">Or Die!</Typography>
                <br />
                <TextField
                    placeholder={!hasStarted ? "Type on!" : ""}
                    focused={true}
                    error={hasErrors}
                    fullWidth={true}
                    value={typedContent} 
                    onChange={updateTypedContent} />
            </Paper>
       </Grid>
    </Grid>)
}

const App = (props) => {
    const worldRef = React.createRef()
    const viewRef = React.createRef()

    const [render, setRender] = React.useState(null)

    const [balls, setBalls] = React.useState([
        createBall()
    ])

    const [runner, setRunner] = React.useState(Runner.create())

    const floor = Bodies.rectangle(400, 560, 800, 10, {
        isStatic: true,
        render: {
            fillStyle: 'gray'
        }
    })

    const rightWall = Bodies.rectangle(790, 315, 20, 480, {
        isStatic: true,
        render: {
            fillStyle: "rgb(200, 10, 10)"
        }
    })

    React.useEffect(() => {
        // Create initial renderer and register the world
        if (!render) {
            let renderer = Render.create({
                element: worldRef.current,
                canvas: viewRef.current,
                engine: engine,
                options: {
                    wireframeBackground: false, 
                    wireframes: false, // Create real things
                    background: "white",
                    width: 800,
                    height: 600,
                }
            })
            Render.lookAt(renderer, {
                min: {x: 0, y: 0},
                max: {x: 800, y: 600},
            })
            Runner.run(runner, engine)
            Render.run(renderer)
            Engine.run(engine)
            setRender(renderer)
            World.add(engine.world, [floor, rightWall])
            return
        }
        
        if (props.doItAgain > 0) {
            let ball = createBall()
            setBalls(balls.concat([ball]))
            launchBall(ball)
            World.addBody(engine.world, ball)
        }
    }, [props.doItAgain, render])

    return <div ref={worldRef}>
        <canvas ref={viewRef} />
    </div>
}


class Root extends React.Component {
    constructor(props) {
        super(props)
        this.state = {count: 0}
        this.restart = this.restart.bind(this)
    }
    restart() {
        this.setState((state) => ({count: state.count+1}))
    }
    render() {

        return (<Grid container>
            <Grid lg={12} item>
                <TypingGame addBall={this.restart} />
            </Grid>
            <Grid lg={12} item>
                <App doItAgain={this.state.count} />
            </Grid>
        </Grid>)
    }
}


ReactDOM.render(<Root />, document.getElementById("app"))