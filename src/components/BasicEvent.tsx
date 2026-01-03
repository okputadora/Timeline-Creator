interface BasicEventProps {
    event: {
        title: string;  
        // other event properties can be added here
    };
    x: number;          
    y: number;
    width: number;
    height: number;
}   

export const BasicEvent: React.FC<BasicEventProps> = ({ event, x, y, width, height = 30 }) => {
    return (
        <div style={{background: "#444", position: "absolute", left: x, top: y, padding: 10}}>
            <h2>
                {event.title}
            </h2>
            <p>hello</p>
        </div>
    )
}